# Keys the flat background out of a reference illustration and trims to the
# subject.
#
# Modes:
#   Matte     — sample backdrop from corner; palette solve for hairlines on white.
#   Yellow    — matte against pure yellow (255,255,0) only; also drops near-black
#               backdrop pixels. Preserves saturated greens on Star Ferry art.
#   Threshold — border flood through backdrop only; keeps original pixel colours.
#               Use for saturated art on dark (or black) backdrops.
#   SkyColumn — per-column peel of uniform sky from the top edge. For flat-colour
#               night skylines where building shadows match the sky navy.
param(
  [Parameter(Mandatory = $true)][string]$In,
  [Parameter(Mandatory = $true)][string]$Out,
  # Below this distance from the backdrop a pixel is backdrop. Set above the
  # artwork's drop shadow, which is otherwise solved as a faint dark smear.
  [int]$Floor = 34,
  # Distance above which a pixel is assumed solid. Kept high on purpose: a
  # pixel that is 70% hull still sits ~165 from the backdrop, and passing it
  # through unsolved is exactly what leaves a warm fringe along every edge.
  [int]$Ceil = 400,
  # Distance above which a pixel is confidently interior, used only to sample
  # the palette. Deliberately separate from $Ceil, which is a pass-2 knob.
  [int]$PaletteMin = 150,
  # Coverage above which the solved colour is discarded and the original kept,
  # so interior shading is not flattened onto the palette.
  [double]$Solid = 0.98,
  # Pixels above this coverage are forced to full opacity so keyed art does not
  # read as a ghost on the animated water beneath.
  [double]$OpaqueMin = 0.08,
  # Matte = palette solve. Yellow = yellow fringe only. Threshold = flood backdrop,
  # keep interior colours (dark-backdrop saturated art).
  [ValidateSet('Matte', 'Yellow', 'Threshold', 'SkyColumn')][string]$Mode = 'Matte',
  # Keep the full canvas (do not trim to opaque bbox). Use for hero art aligned to a fixed frame.
  [switch]$NoTrim,
  # Downscale before keying (much faster on 5K+ sources; output matches this width).
  [int]$MaxWidth = 0,
  # Pad to this height (transparent top) so light/dark exports share one canvas.
  [int]$CanvasHeight = 0,
  # Shift art so the pier foot sits on the same row in every export.
  [switch]$AlignFoot,
  [int]$FootMargin = 8
)

Add-Type -AssemblyName System.Drawing

$src = [System.Drawing.Bitmap]::FromFile((Resolve-Path $In))
if ($MaxWidth -gt 0 -and $src.Width -gt $MaxWidth) {
  $newH = [int][Math]::Round($src.Height * $MaxWidth / $src.Width)
  $scaled = New-Object System.Drawing.Bitmap $MaxWidth, $newH, ([System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
  $g = [System.Drawing.Graphics]::FromImage($scaled)
  $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $g.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
  $g.DrawImage($src, 0, 0, $MaxWidth, $newH)
  $g.Dispose()
  $src.Dispose()
  $src = $scaled
  Write-Host ("downscale to {0}x{1}" -f $MaxWidth, $newH)
}
$w = $src.Width
$h = $src.Height
$rect = New-Object System.Drawing.Rectangle 0, 0, $w, $h
$data = $src.LockBits($rect, [System.Drawing.Imaging.ImageLockMode]::ReadOnly,
  [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$stride = $data.Stride
$bytes = New-Object byte[] ($stride * $h)
[System.Runtime.InteropServices.Marshal]::Copy($data.Scan0, $bytes, 0, $bytes.Length)
$src.UnlockBits($data)
$src.Dispose()

$artTop = 0
if ($CanvasHeight -gt 0 -and $CanvasHeight -gt $h) {
  $padTop = $CanvasHeight - $h
  $newBytes = New-Object byte[] ($stride * $CanvasHeight)
  for ($i = 0; $i -lt $newBytes.Length; $i++) { $newBytes[$i] = 0 }
  for ($y = 0; $y -lt $h; $y++) {
    [Array]::Copy($bytes, $y * $stride, $newBytes, ($padTop + $y) * $stride, $stride)
  }
  $bytes = $newBytes
  $artTop = $padTop
  $h = $CanvasHeight
  Write-Host ("pad top {0}px -> canvas {1}" -f $padTop, $CanvasHeight)
}

$ci = $artTop * $stride
$bB = [double]$bytes[$ci]; $bG = [double]$bytes[$ci + 1]; $bR = [double]$bytes[$ci + 2]
if ($Mode -eq 'Yellow') {
  $bR = 255.0; $bG = 255.0; $bB = 0.0
}
Write-Host ("backdrop rgb({0},{1},{2}) mode={3}" -f $bR, $bG, $bB, $Mode)

$sourceBytes = New-Object byte[] $bytes.Length
[Array]::Copy($bytes, $sourceBytes, $bytes.Length)

function Get-BackdropDistAt([byte[]]$buf, [int]$bi) {
  $bb = [double]$buf[$bi]; $bg = [double]$buf[$bi + 1]; $br = [double]$buf[$bi + 2]
  return [Math]::Sqrt(($br - $bR) * ($br - $bR) + ($bg - $bG) * ($bg - $bG) + ($bb - $bB) * ($bb - $bB))
}

# ---- pass 1: palette from the solid interior (skipped for Threshold/SkyColumn)
if ($Mode -ne 'Threshold' -and $Mode -ne 'SkyColumn') {
$hist = @{}
for ($y = 0; $y -lt $h; $y++) {
  $row = $y * $stride
  for ($x = 0; $x -lt $w; $x++) {
    $i = $row + $x * 4
    $b = [double]$bytes[$i]; $g = [double]$bytes[$i + 1]; $r = [double]$bytes[$i + 2]
    $d = [Math]::Sqrt(($r - $bR) * ($r - $bR) + ($g - $bG) * ($g - $bG) + ($b - $bB) * ($b - $bB))
    if ($d -le $PaletteMin) { continue }
    # Floor, not [int]: PowerShell's cast rounds, which overflows the top bucket.
    $key = ([int][Math]::Floor($r / 16) * 4096) + ([int][Math]::Floor($g / 16) * 64) +
    [int][Math]::Floor($b / 16)
    if ($hist.ContainsKey($key)) { $hist[$key] = $hist[$key] + 1 } else { $hist[$key] = 1 }
  }
}
$palette = @()
foreach ($k in ($hist.GetEnumerator() | Sort-Object -Property Value -Descending | Select-Object -First 10)) {
  $key = [int]$k.Key
  $pr = [Math]::Min(255.0, [double]((($key -shr 12) -band 63) * 16 + 8))
  $pg = [Math]::Min(255.0, [double]((($key -shr 6) -band 63) * 16 + 8))
  $pb = [Math]::Min(255.0, [double](($key -band 63) * 16 + 8))
  $palette += , @($pr, $pg, $pb)
  Write-Host ("  palette rgb({0},{1},{2})  n={3}" -f $pr, $pg, $pb, $k.Value)
}
# White is what the hairlines are made of and may be too thin to reach the
# histogram, so guarantee it is a candidate.
$palette += , @(255.0, 255.0, 255.0)
if ($Mode -eq 'Yellow') {
  # Greens must be candidates or the hull gets quantised to grey off yellow.
  $palette += , @(32.0, 96.0, 48.0)
  $palette += , @(24.0, 80.0, 40.0)
  $palette += , @(16.0, 64.0, 32.0)
  $palette += , @(8.0, 48.0, 24.0)
  $palette += , @(0.0, 0.0, 0.0)
}
$np = $palette.Count
}

# ---- pass 2: matte / threshold ---------------------------------------------
$minX = $w; $maxX = -1; $minY = $h; $maxY = -1

if ($Mode -eq 'SkyColumn') {
  # Building shadows share the sky navy — distance keys eat the art. Peel only the
  # contiguous sky band from the top of each column.
  function Is-SkyBackdrop([double]$r, [double]$g, [double]$b) {
    $d = [Math]::Sqrt(($r - $bR) * ($r - $bR) + ($g - $bG) * ($g - $bG) + ($b - $bB) * ($b - $bB))
    return ($d -le $Floor)
  }
  for ($x = 0; $x -lt $w; $x++) {
    for ($y = 0; $y -lt $h; $y++) {
      $i = $y * $stride + $x * 4
      $r = [double]$bytes[$i + 2]; $g = [double]$bytes[$i + 1]; $b = [double]$bytes[$i]
      if (-not (Is-SkyBackdrop $r $g $b)) { break }
      $bytes[$i] = 0; $bytes[$i + 1] = 0; $bytes[$i + 2] = 0; $bytes[$i + 3] = 0
    }
  }
  # Backdrop bleed along the bottom edge (red export margin under the pier).
  $visB = New-Object bool[] ($w * $h)
  $qB = New-Object System.Collections.Generic.Queue[int]
  function TryEnqueue-SkyBottom([int]$px, [int]$py) {
    if ($px -lt 0 -or $py -lt 0 -or $px -ge $w -or $py -ge $h) { return }
    $idx = $py * $w + $px
    if ($visB[$idx]) { return }
    $bi = $py * $stride + $px * 4
    if ($bytes[$bi + 3] -lt 8) { return }
    $r = [double]$bytes[$bi + 2]; $g = [double]$bytes[$bi + 1]; $b = [double]$bytes[$bi]
    if (-not (Is-SkyBackdrop $r $g $b)) { return }
    $visB[$idx] = $true
    $qB.Enqueue($idx)
  }
  for ($px = 0; $px -lt $w; $px++) { TryEnqueue-SkyBottom $px ($h - 1) }
  while ($qB.Count -gt 0) {
    $idx = $qB.Dequeue()
    $py = [Math]::Floor($idx / $w)
    $px = $idx % $w
    $bi = $py * $stride + $px * 4
    $bytes[$bi] = 0; $bytes[$bi + 1] = 0; $bytes[$bi + 2] = 0; $bytes[$bi + 3] = 0
    TryEnqueue-SkyBottom ($px - 1) $py
    TryEnqueue-SkyBottom ($px + 1) $py
    TryEnqueue-SkyBottom ($px - 1) ($py - 1)
    TryEnqueue-SkyBottom ($px + 1) ($py - 1)
    TryEnqueue-SkyBottom ($px - 1) ($py + 1)
    TryEnqueue-SkyBottom ($px + 1) ($py + 1)
    TryEnqueue-SkyBottom $px ($py - 1)
    TryEnqueue-SkyBottom $px ($py + 1)
  }
  # Backdrop pockets from left/right (tower gaps) and any top bleed.
  $visE = New-Object bool[] ($w * $h)
  $qE = New-Object System.Collections.Generic.Queue[int]
  function Is-SkyBackdropWide([double]$r, [double]$g, [double]$b) {
    $d = [Math]::Sqrt(($r - $bR) * ($r - $bR) + ($g - $bG) * ($g - $bG) + ($b - $bB) * ($b - $bB))
    return ($d -le ($Floor + 32))
  }
  function TryEnqueue-SkyEdge([int]$px, [int]$py) {
    if ($px -lt 0 -or $py -lt 0 -or $px -ge $w -or $py -ge $h) { return }
    $idx = $py * $w + $px
    if ($visE[$idx]) { return }
    $bi = $py * $stride + $px * 4
    if ($bytes[$bi + 3] -lt 8) { return }
    $r = [double]$bytes[$bi + 2]; $g = [double]$bytes[$bi + 1]; $b = [double]$bytes[$bi]
    if (-not (Is-SkyBackdropWide $r $g $b)) { return }
    $visE[$idx] = $true
    $qE.Enqueue($idx)
  }
  for ($px = 0; $px -lt $w; $px++) {
    TryEnqueue-SkyEdge $px 0
    TryEnqueue-SkyEdge $px ($h - 1)
  }
  for ($py = 0; $py -lt $h; $py++) {
    TryEnqueue-SkyEdge 0 $py
    TryEnqueue-SkyEdge ($w - 1) $py
  }
  while ($qE.Count -gt 0) {
    $idx = $qE.Dequeue()
    $py = [Math]::Floor($idx / $w)
    $px = $idx % $w
    $bi = $py * $stride + $px * 4
    $bytes[$bi] = 0; $bytes[$bi + 1] = 0; $bytes[$bi + 2] = 0; $bytes[$bi + 3] = 0
    TryEnqueue-SkyEdge ($px - 1) $py
    TryEnqueue-SkyEdge ($px + 1) $py
    TryEnqueue-SkyEdge $px ($py - 1)
    TryEnqueue-SkyEdge $px ($py + 1)
  }
  function Has-ReachClear([int]$px, [int]$py, [int]$reach) {
    for ($dy = -$reach; $dy -le $reach; $dy++) {
      for ($dx = -$reach; $dx -le $reach; $dx++) {
        if (($dx * $dx + $dy * $dy) -gt ($reach * $reach)) { continue }
        $nx = $px + $dx; $ny = $py + $dy
        if ($nx -lt 0 -or $ny -lt 0 -or $nx -ge $w -or $ny -ge $h) { continue }
        if ($bytes[$ny * $stride + $nx * 4 + 3] -lt 8) { return $true }
      }
    }
    return $false
  }
  # Triangular / gap pockets — BFS flood backdrop connected to transparency.
  $visP = New-Object bool[] ($w * $h)
  $qP = New-Object System.Collections.Generic.Queue[int]
  function TryEnqueue-Pocket([int]$px, [int]$py) {
    if ($px -lt 0 -or $py -lt 0 -or $px -ge $w -or $py -ge $h) { return }
    $idx = $py * $w + $px
    if ($visP[$idx]) { return }
    $bi = $py * $stride + $px * 4
    if ($bytes[$bi + 3] -lt 8) { return }
    $r = [double]$bytes[$bi + 2]; $g = [double]$bytes[$bi + 1]; $b = [double]$bytes[$bi]
    if (-not (Is-SkyBackdrop $r $g $b)) { return }
    $visP[$idx] = $true
    $qP.Enqueue($idx)
  }
  for ($py = 0; $py -lt $h; $py++) {
    for ($px = 0; $px -lt $w; $px++) {
      $bi = $py * $stride + $px * 4
      if ($bytes[$bi + 3] -lt 8) { continue }
      if (-not (Has-ReachClear $px $py 3)) { continue }
      TryEnqueue-Pocket $px $py
    }
  }
  while ($qP.Count -gt 0) {
    $idx = $qP.Dequeue()
    $py = [Math]::Floor($idx / $w)
    $px = $idx % $w
    $bi = $py * $stride + $px * 4
    $bytes[$bi] = 0; $bytes[$bi + 1] = 0; $bytes[$bi + 2] = 0; $bytes[$bi + 3] = 0
    TryEnqueue-Pocket ($px - 1) $py
    TryEnqueue-Pocket ($px + 1) $py
    TryEnqueue-Pocket $px ($py - 1)
    TryEnqueue-Pocket $px ($py + 1)
    TryEnqueue-Pocket ($px - 1) ($py - 1)
    TryEnqueue-Pocket ($px + 1) ($py - 1)
    TryEnqueue-Pocket ($px - 1) ($py + 1)
    TryEnqueue-Pocket ($px + 1) ($py + 1)
  }
  # Pink anti-alias halo touching transparency (not yellow window lights).
  function Is-RedFringe([double]$r, [double]$g, [double]$b) {
    if ($g -gt 175 -and $r -gt 160) { return $false }
    $d = [Math]::Sqrt(($r - $bR) * ($r - $bR) + ($g - $bG) * ($g - $bG) + ($b - $bB) * ($b - $bB))
    if ($d -le ($Floor + 28)) { return $true }
    return ($r -gt $g + 6 -and $r -gt $b + 4 -and $r -gt 72 -and $d -le 95)
  }
  function Has-ClearNeighborSky([int]$px, [int]$py) {
    foreach ($d in @(@(-1, 0), @(1, 0), @(0, -1), @(0, 1), @(-1, -1), @(1, -1), @(-1, 1), @(1, 1))) {
      $nx = $px + $d[0]; $ny = $py + $d[1]
      if ($nx -lt 0 -or $ny -lt 0 -or $nx -ge $w -or $ny -ge $h) { continue }
      if ($bytes[$ny * $stride + $nx * 4 + 3] -lt 8) { return $true }
    }
    return $false
  }
  $visF = New-Object bool[] ($w * $h)
  $qF = New-Object System.Collections.Generic.Queue[int]
  function TryEnqueue-Fringe([int]$px, [int]$py) {
    if ($px -lt 0 -or $py -lt 0 -or $px -ge $w -or $py -ge $h) { return }
    $idx = $py * $w + $px
    if ($visF[$idx]) { return }
    $bi = $py * $stride + $px * 4
    if ($bytes[$bi + 3] -lt 8) { return }
    $r = [double]$bytes[$bi + 2]; $g = [double]$bytes[$bi + 1]; $b = [double]$bytes[$bi]
    if (-not (Is-RedFringe $r $g $b)) { return }
    $visF[$idx] = $true
    $qF.Enqueue($idx)
  }
  for ($py = 0; $py -lt $h; $py++) {
    for ($px = 0; $px -lt $w; $px++) {
      if (-not (Has-ClearNeighborSky $px $py)) { continue }
      TryEnqueue-Fringe $px $py
    }
  }
  while ($qF.Count -gt 0) {
    $idx = $qF.Dequeue()
    $py = [Math]::Floor($idx / $w)
    $px = $idx % $w
    $bi = $py * $stride + $px * 4
    $bytes[$bi] = 0; $bytes[$bi + 1] = 0; $bytes[$bi + 2] = 0; $bytes[$bi + 3] = 0
    TryEnqueue-Fringe ($px - 1) $py
    TryEnqueue-Fringe ($px + 1) $py
    TryEnqueue-Fringe $px ($py - 1)
    TryEnqueue-Fringe $px ($py + 1)
    TryEnqueue-Fringe ($px - 1) ($py - 1)
    TryEnqueue-Fringe ($px + 1) ($py - 1)
    TryEnqueue-Fringe ($px - 1) ($py + 1)
    TryEnqueue-Fringe ($px + 1) ($py + 1)
  }
  for ($y = 0; $y -lt $h; $y++) {
    $row = $y * $stride
    for ($x = 0; $x -lt $w; $x++) {
      $i = $row + $x * 4
      if ($bytes[$i + 3] -eq 0) { continue }
      $bytes[$i + 3] = 255
      if ($x -lt $minX) { $minX = $x }
      if ($x -gt $maxX) { $maxX = $x }
      if ($y -lt $minY) { $minY = $y }
      if ($y -gt $maxY) { $maxY = $y }
    }
  }
}
elseif ($Mode -eq 'Threshold') {
  # Matte clears every d<=Floor pixel globally, punching holes in dark building
  # shades that sit near a navy backdrop. Flood from the border instead.
  $vis = New-Object bool[] ($w * $h)
  $queue = New-Object System.Collections.Generic.Queue[int]
  function Get-BackdropDist([int]$bi) {
    $bb = [double]$bytes[$bi]; $bg = [double]$bytes[$bi + 1]; $br = [double]$bytes[$bi + 2]
    return [Math]::Sqrt(($br - $bR) * ($br - $bR) + ($bg - $bG) * ($bg - $bG) + ($bb - $bB) * ($bb - $bB))
  }
  function TryEnqueue-ThreshBg([int]$px, [int]$py) {
    if ($px -lt 0 -or $py -lt 0 -or $px -ge $w -or $py -ge $h) { return }
    $idx = $py * $w + $px
    if ($vis[$idx]) { return }
    $bi = $py * $stride + $px * 4
    if ((Get-BackdropDist $bi) -gt $Floor) { return }
    $vis[$idx] = $true
    $queue.Enqueue($idx)
  }
  for ($px = 0; $px -lt $w; $px++) {
    TryEnqueue-ThreshBg $px 0
    TryEnqueue-ThreshBg $px ($h - 1)
  }
  for ($py = 0; $py -lt $h; $py++) {
    TryEnqueue-ThreshBg 0 $py
    TryEnqueue-ThreshBg ($w - 1) $py
  }
  while ($queue.Count -gt 0) {
    $idx = $queue.Dequeue()
    $py = [Math]::Floor($idx / $w)
    $px = $idx % $w
    $bi = $py * $stride + $px * 4
    $bytes[$bi] = 0; $bytes[$bi + 1] = 0; $bytes[$bi + 2] = 0; $bytes[$bi + 3] = 0
    TryEnqueue-ThreshBg ($px - 1) $py
    TryEnqueue-ThreshBg ($px + 1) $py
    TryEnqueue-ThreshBg $px ($py - 1)
    TryEnqueue-ThreshBg $px ($py + 1)
  }
  for ($y = 0; $y -lt $h; $y++) {
    $row = $y * $stride
    for ($x = 0; $x -lt $w; $x++) {
      $i = $row + $x * 4
      if ($bytes[$i + 3] -eq 0) { continue }
      $bytes[$i + 3] = 255
      if ($x -lt $minX) { $minX = $x }
      if ($x -gt $maxX) { $maxX = $x }
      if ($y -lt $minY) { $minY = $y }
      if ($y -gt $maxY) { $maxY = $y }
    }
  }
}
else {
for ($y = 0; $y -lt $h; $y++) {
  $row = $y * $stride
  for ($x = 0; $x -lt $w; $x++) {
    $i = $row + $x * 4
    $b = [double]$bytes[$i]; $g = [double]$bytes[$i + 1]; $r = [double]$bytes[$i + 2]
    $d = [Math]::Sqrt(($r - $bR) * ($r - $bR) + ($g - $bG) * ($g - $bG) + ($b - $bB) * ($b - $bB))

    if ($d -le $Floor) {
      $bytes[$i] = 0; $bytes[$i + 1] = 0; $bytes[$i + 2] = 0; $bytes[$i + 3] = 0
      continue
    }

    if ($Mode -eq 'Yellow') {
      # Matte only on yellow fringe (white masts etc.). Dark greens and everything
      # else keep their original pixel untouched.
      $yellowness = [Math]::Min($r, $g) - $b
      $greenish = ($g -gt $r + 6 -and $g -gt $b + 6 -and $g -ge 18)
      $yellowish = ($yellowness -gt 35 -and $r -gt 100 -and $g -gt 100)
      if (-not $greenish -and $yellowish -and $d -lt $Ceil) {
        $bestErr = [double]::MaxValue; $bestA = 1.0; $fr = $r; $fg = $g; $fb = $b
        $or = $r; $og = $g; $ob = $b
        for ($p = 0; $p -lt $np; $p++) {
          $pr = $palette[$p][0]; $pg = $palette[$p][1]; $pb = $palette[$p][2]
          $dr = $pr - $bR; $dg = $pg - $bG; $db = $pb - $bB
          $den = $dr * $dr + $dg * $dg + $db * $db
          if ($den -lt 1) { continue }
          $a = (($r - $bR) * $dr + ($g - $bG) * $dg + ($b - $bB) * $db) / $den
          if ($a -lt 0) { $a = 0.0 } elseif ($a -gt 1) { $a = 1.0 }
          $er = $r - ($bR + $a * $dr); $eg = $g - ($bG + $a * $dg); $eb = $b - ($bB + $a * $db)
          $err = $er * $er + $eg * $eg + $eb * $eb
          if ($err -lt $bestErr) { $bestErr = $err; $bestA = $a; $fr = $pr; $fg = $pg; $fb = $pb }
        }
        if ($bestA -ge $Solid) {
          $r = $or; $g = $og; $b = $ob; $alpha = 1.0
        }
        else {
          $r = $fr; $g = $fg; $b = $fb; $alpha = $bestA
        }
      }
      else { $alpha = 1.0 }
    }
    elseif ($d -lt $Ceil) {
      $bestErr = [double]::MaxValue; $bestA = 1.0; $fr = $r; $fg = $g; $fb = $b
      $or = $r; $og = $g; $ob = $b
      for ($p = 0; $p -lt $np; $p++) {
        $pr = $palette[$p][0]; $pg = $palette[$p][1]; $pb = $palette[$p][2]
        $dr = $pr - $bR; $dg = $pg - $bG; $db = $pb - $bB
        $den = $dr * $dr + $dg * $dg + $db * $db
        if ($den -lt 1) { continue }
        # Least-squares coverage along the backdrop -> palette colour segment.
        $a = (($r - $bR) * $dr + ($g - $bG) * $dg + ($b - $bB) * $db) / $den
        if ($a -lt 0) { $a = 0.0 } elseif ($a -gt 1) { $a = 1.0 }
        $er = $r - ($bR + $a * $dr); $eg = $g - ($bG + $a * $dg); $eb = $b - ($bB + $a * $db)
        $err = $er * $er + $eg * $eg + $eb * $eb
        if ($err -lt $bestErr) { $bestErr = $err; $bestA = $a; $fr = $pr; $fg = $pg; $fb = $pb }
      }
      if ($bestA -ge $Solid) {
        $r = $or; $g = $og; $b = $ob; $alpha = 1.0
      }
      else {
        $r = $fr; $g = $fg; $b = $fb; $alpha = $bestA
      }
    }
    else { $alpha = 1.0 }

    if ($alpha -le 0.004) {
      $bytes[$i] = 0; $bytes[$i + 1] = 0; $bytes[$i + 2] = 0; $bytes[$i + 3] = 0
      continue
    }

    if ($alpha -gt $OpaqueMin) { $alpha = 1.0 }

    $bytes[$i] = [byte][Math]::Round($b)
    $bytes[$i + 1] = [byte][Math]::Round($g)
    $bytes[$i + 2] = [byte][Math]::Round($r)
    $bytes[$i + 3] = [byte][Math]::Round($alpha * 255)

    if ($alpha -gt 0.15) {
      if ($x -lt $minX) { $minX = $x }
      if ($x -gt $maxX) { $maxX = $x }
      if ($y -lt $minY) { $minY = $y }
      if ($y -gt $maxY) { $maxY = $y }
    }
  }
}
}

if ($Mode -eq 'Yellow') {
  function Is-Greenish([int]$bi) {
    $br = [int]$bytes[$bi + 2]; $bg = [int]$bytes[$bi + 1]; $bb = [int]$bytes[$bi]
    return ($bg -gt $br + 6 -and $bg -gt $bb + 6 -and $bg -ge 14)
  }
  function Is-SuperBlack([int]$bi) {
    if (Is-Greenish $bi) { return $false }
    $br = [int]$bytes[$bi + 2]; $bg = [int]$bytes[$bi + 1]; $bb = [int]$bytes[$bi]
    return ($br -le 4 -and $bg -le 4 -and $bb -le 4)
  }
  # Anti-alias fringe around keyed edges — still not green or window glass.
  function Is-BackdropBlack([int]$bi) {
    if (Is-Greenish $bi) { return $false }
    $br = [int]$bytes[$bi + 2]; $bg = [int]$bytes[$bi + 1]; $bb = [int]$bytes[$bi]
    if ($bb -gt 16 -and $bb -gt $br + 4) { return $false }
    return ($br -le 12 -and $bg -le 12 -and $bb -le 12)
  }

  # Black exports: flood-fill super-black backdrop from the border.
  $vis = New-Object bool[] ($w * $h)
  $queue = New-Object System.Collections.Generic.Queue[int]
  function TryEnqueue-YellowBg([int]$px, [int]$py) {
    if ($px -lt 0 -or $py -lt 0 -or $px -ge $w -or $py -ge $h) { return }
    $idx = $py * $w + $px
    if ($vis[$idx]) { return }
    $bi = $py * $stride + $px * 4
    if (-not (Is-SuperBlack $bi)) { return }
    $vis[$idx] = $true
    $queue.Enqueue($idx)
  }
  for ($px = 0; $px -lt $w; $px++) {
    TryEnqueue-YellowBg $px 0
    TryEnqueue-YellowBg $px ($h - 1)
  }
  for ($py = 0; $py -lt $h; $py++) {
    TryEnqueue-YellowBg 0 $py
    TryEnqueue-YellowBg ($w - 1) $py
  }
  while ($queue.Count -gt 0) {
    $idx = $queue.Dequeue()
    $py = [Math]::Floor($idx / $w)
    $px = $idx % $w
    $bi = $py * $stride + $px * 4
    $bytes[$bi] = 0; $bytes[$bi + 1] = 0; $bytes[$bi + 2] = 0; $bytes[$bi + 3] = 0
    TryEnqueue-YellowBg ($px - 1) $py
    TryEnqueue-YellowBg ($px + 1) $py
    TryEnqueue-YellowBg $px ($py - 1)
    TryEnqueue-YellowBg $px ($py + 1)
  }

  # Mast rigging traps super-black inside the bow/stern triangles. Seed from
  # white stays in the upper quarter of the subject and flood through super-black
  # only — leaves the funnel star and tyre blacks untouched.
  function Is-White([int]$bi) {
    $br = [int]$bytes[$bi + 2]; $bg = [int]$bytes[$bi + 1]; $bb = [int]$bytes[$bi]
    return ($br -gt 235 -and $bg -gt 235 -and $bb -gt 235)
  }
  function Is-NearWhite([int]$bi) {
    $br = [int]$bytes[$bi + 2]; $bg = [int]$bytes[$bi + 1]; $bb = [int]$bytes[$bi]
    return ($br -gt 200 -and $bg -gt 200 -and $bb -gt 200)
  }
  function Is-WindowVoid([int]$bi) {
    if (Is-Greenish $bi -or Is-NearWhite $bi) { return $false }
    if (Is-BackdropBlack $bi) { return $true }
    $br = [int]$bytes[$bi + 2]; $bg = [int]$bytes[$bi + 1]; $bb = [int]$bytes[$bi]
  # Navy window glass on the white upper deck.
    if ($bb -gt $br + 2 -and $bb -gt 20) { return ($br -le 28 -and $bg -le 44 -and $bb -le 100) }
    return $false
  }
  function Has-ClearNeighbor([int]$px, [int]$py) {
    foreach ($d in @(@(-1, 0), @(1, 0), @(0, -1), @(0, 1), @(-1, -1), @(1, -1), @(-1, 1), @(1, 1))) {
      $nx = $px + $d[0]; $ny = $py + $d[1]
      if ($nx -lt 0 -or $ny -lt 0 -or $nx -ge $w -or $ny -ge $h) { continue }
      if ($bytes[$ny * $stride + $nx * 4 + 3] -lt 8) { return $true }
    }
    return $false
  }
  function Has-WhiteNeighbor([int]$px, [int]$py) {
    foreach ($d in @(@(-1, 0), @(1, 0), @(0, -1), @(0, 1), @(-1, -1), @(1, -1), @(-1, 1), @(1, 1))) {
      $nx = $px + $d[0]; $ny = $py + $d[1]
      if ($nx -lt 0 -or $ny -lt 0 -or $nx -ge $w -or $ny -ge $h) { continue }
      $nb = $ny * $stride + $nx * 4
      if (Is-White $nb) { return $true }
    }
    return $false
  }
  function Has-NearWhiteNeighbor([int]$px, [int]$py) {
    foreach ($d in @(@(-1, 0), @(1, 0), @(0, -1), @(0, 1), @(-1, -1), @(1, -1), @(-1, 1), @(1, 1))) {
      $nx = $px + $d[0]; $ny = $py + $d[1]
      if ($nx -lt 0 -or $ny -lt 0 -or $nx -ge $w -or $ny -ge $h) { continue }
      $nb = $ny * $stride + $nx * 4
      if ($bytes[$nb + 3] -lt 8) { continue }
      if (Is-NearWhite $nb) { return $true }
    }
    return $false
  }
  # Yellow-matte hairlines read as dark grey, not near-white — still rigging stays.
  function Is-RiggingArt([int]$bi) {
    if ($bytes[$bi + 3] -lt 8) { return $false }
    if (Is-Greenish $bi) { return $false }
    if (Is-BackdropBlack $bi) { return $false }
    if (Is-NearWhite $bi) { return $true }
    $br = [int]$bytes[$bi + 2]; $bg = [int]$bytes[$bi + 1]; $bb = [int]$bytes[$bi]
    $lum = ($br + $bg + $bb) / 3.0
    if ($lum -lt 10 -or $lum -gt 130) { return $false }
    return ($br -le 95 -and $bg -le 95 -and $bb -le 95)
  }
  function Has-GreenNeighbor([int]$px, [int]$py) {
    foreach ($d in @(@(-1, 0), @(1, 0), @(0, -1), @(0, 1), @(-1, -1), @(1, -1), @(-1, 1), @(1, 1))) {
      $nx = $px + $d[0]; $ny = $py + $d[1]
      if ($nx -lt 0 -or $ny -lt 0 -or $nx -ge $w -or $ny -ge $h) { continue }
      if (Is-Greenish ($ny * $stride + $nx * 4)) { return $true }
    }
    return $false
  }
  function Clear-VoidRegion(
    [int]$x0, [int]$x1, [int]$y0, [int]$y1,
    [scriptblock]$IsVoid,
    [scriptblock]$IsSeed
  ) {
    $vis = New-Object bool[] ($w * $h)
    $q = New-Object System.Collections.Generic.Queue[int]
    function Enqueue-Void([int]$px, [int]$py) {
      if ($px -lt $x0 -or $px -gt $x1 -or $py -lt $y0 -or $py -gt $y1) { return }
      if ($px -lt 0 -or $py -lt 0 -or $px -ge $w -or $py -ge $h) { return }
      $idx = $py * $w + $px
      if ($vis[$idx]) { return }
      $bi = $py * $stride + $px * 4
      if ($bytes[$bi + 3] -lt 8) { return }
      if (Is-NearWhite $bi) { return }
      if (-not (& $IsVoid $bi)) { return }
      $vis[$idx] = $true
      $q.Enqueue($idx)
    }
    for ($py = $y0; $py -le $y1; $py++) {
      for ($px = $x0; $px -le $x1; $px++) {
        $bi = $py * $stride + $px * 4
        if ($bytes[$bi + 3] -lt 8) { continue }
        if (Is-NearWhite $bi) { continue }
        if (-not (& $IsVoid $bi)) { continue }
        if (& $IsSeed $px $py) { Enqueue-Void $px $py }
      }
    }
    while ($q.Count -gt 0) {
      $idx = $q.Dequeue()
      $py = [Math]::Floor($idx / $w)
      $px = $idx % $w
      $bi = $py * $stride + $px * 4
      $bytes[$bi] = 0; $bytes[$bi + 1] = 0; $bytes[$bi + 2] = 0; $bytes[$bi + 3] = 0
      Enqueue-Void ($px - 1) $py
      Enqueue-Void ($px + 1) $py
      Enqueue-Void $px ($py - 1)
      Enqueue-Void $px ($py + 1)
      Enqueue-Void ($px - 1) ($py - 1)
      Enqueue-Void ($px + 1) ($py - 1)
      Enqueue-Void ($px - 1) ($py + 1)
      Enqueue-Void ($px + 1) ($py + 1)
    }
  }
  # Flood void from rigging/deck art edges (handles grey anti-alias stays on the right mast).
  function Flood-ClearVoidFromArt(
    [int]$x0, [int]$x1, [int]$y0, [int]$y1,
    [scriptblock]$IsVoid,
    [scriptblock]$IsArt,
    [scriptblock]$ProtectVoid
  ) {
    $vis = New-Object bool[] ($w * $h)
    $q = New-Object System.Collections.Generic.Queue[int]
    function TryEnqueue-ArtVoid([int]$vx, [int]$vy) {
      if ($vx -lt $x0 -or $vx -gt $x1 -or $vy -lt $y0 -or $vy -gt $y1) { return }
      if ($vx -lt 0 -or $vy -lt 0 -or $vx -ge $w -or $vy -ge $h) { return }
      $idx = $vy * $w + $vx
      if ($vis[$idx]) { return }
      $bi = $vy * $stride + $vx * 4
      if ($bytes[$bi + 3] -lt 8) { return }
      if (-not (& $IsVoid $bi)) { return }
      if (& $ProtectVoid $vx $vy) { return }
      $vis[$idx] = $true
      $q.Enqueue($idx)
    }
    for ($py = $y0; $py -le $y1; $py++) {
      for ($px = $x0; $px -le $x1; $px++) {
        $bi = $py * $stride + $px * 4
        if ($bytes[$bi + 3] -lt 8) { continue }
        if (-not (& $IsArt $bi)) { continue }
        TryEnqueue-ArtVoid ($px - 1) $py
        TryEnqueue-ArtVoid ($px + 1) $py
        TryEnqueue-ArtVoid $px ($py - 1)
        TryEnqueue-ArtVoid $px ($py + 1)
        TryEnqueue-ArtVoid ($px - 1) ($py - 1)
        TryEnqueue-ArtVoid ($px + 1) ($py - 1)
        TryEnqueue-ArtVoid ($px - 1) ($py + 1)
        TryEnqueue-ArtVoid ($px + 1) ($py + 1)
      }
    }
    while ($q.Count -gt 0) {
      $idx = $q.Dequeue()
      $vy = [Math]::Floor($idx / $w)
      $vx = $idx % $w
      $bi = $vy * $stride + $vx * 4
      $bytes[$bi] = 0; $bytes[$bi + 1] = 0; $bytes[$bi + 2] = 0; $bytes[$bi + 3] = 0
      TryEnqueue-ArtVoid ($vx - 1) $vy
      TryEnqueue-ArtVoid ($vx + 1) $vy
      TryEnqueue-ArtVoid $vx ($vy - 1)
      TryEnqueue-ArtVoid $vx ($vy + 1)
      TryEnqueue-ArtVoid ($vx - 1) ($vy - 1)
      TryEnqueue-ArtVoid ($vx + 1) ($vy - 1)
      TryEnqueue-ArtVoid ($vx - 1) ($vy + 1)
      TryEnqueue-ArtVoid ($vx + 1) ($vy + 1)
    }
  }
  function Protect-WhiteDetail([int]$px, [int]$py) {
    return (Has-WhiteNeighbor $px $py) -or (Has-NearWhiteNeighbor $px $py)
  }

  $subjH = $maxY - $minY + 1
  $cw = $maxX - $minX + 1
  $mastBandY = $minY + [int]($subjH * 0.36)
  $riggingBandY = $minY + [int]($subjH * 0.34)
  $deckTop = $minY + [int]($subjH * 0.21)
  $deckBottom = $minY + [int]($subjH * 0.41)
  $detailBandTop = $minY + [int]($subjH * 0.18)
  $detailBandBottom = $minY + [int]($subjH * 0.44)
  $rightX0 = $minX + [int]($cw * 0.50)
  $protectDetail = { param($px, $py)
    $py -ge $detailBandTop -and $py -le $detailBandBottom -and (Protect-WhiteDetail $px $py)
  }

  # Bow/stern rigging triangles — left clears via green hull; right via grey stay flood.
  Clear-VoidRegion $minX $maxX $minY $riggingBandY { param($bi) (Is-BackdropBlack $bi) } {
    param($px, $py)
    if (& $protectDetail $px $py) { return $false }
    (Has-ClearNeighbor $px $py) -or (Has-GreenNeighbor $px $py) -or
    (Has-NearWhiteNeighbor $px $py) -or (Has-WhiteNeighbor $px $py)
  }
  Flood-ClearVoidFromArt $minX $maxX $minY $riggingBandY { param($bi) (Is-BackdropBlack $bi) } {
    param($bi) (Is-RiggingArt $bi)
  } $protectDetail
  Flood-ClearVoidFromArt $rightX0 $maxX $minY $riggingBandY { param($bi) (Is-BackdropBlack $bi) } {
    param($bi) (Is-RiggingArt $bi)
  } $protectDetail

  # First deck window row — void through navy glass; keep white lifebuoy circles.
  Clear-VoidRegion $minX $maxX $deckTop $deckBottom { param($bi) (Is-WindowVoid $bi) } {
    param($px, $py)
    if (Protect-WhiteDetail $px $py) { return $false }
    (Has-NearWhiteNeighbor $px $py) -or (Has-WhiteNeighbor $px $py) -or (Has-ClearNeighbor $px $py)
  }
  Flood-ClearVoidFromArt $minX $maxX $deckTop $deckBottom { param($bi) (Is-WindowVoid $bi) } {
    param($bi) (Is-NearWhite $bi)
  } { param($px, $py) (Protect-WhiteDetail $px $py) }

  # Hull halo: peel backdrop-black that touches transparency, but keep black
  # details painted on white (star, funnel cap) in the mid band.
  $peel = $true
  while ($peel) {
    $peel = $false
    for ($py = $minY; $py -le $maxY; $py++) {
      for ($px = $minX; $px -le $maxX; $px++) {
        $bi = $py * $stride + $px * 4
        if ($bytes[$bi + 3] -lt 8) { continue }
        if (-not (Is-BackdropBlack $bi)) { continue }
        if ($py -ge $detailBandTop -and $py -le $detailBandBottom -and (Has-WhiteNeighbor $px $py)) { continue }
        $touchClear = $false
        foreach ($d in @(@(-1, 0), @(1, 0), @(0, -1), @(0, 1), @(-1, -1), @(1, -1), @(-1, 1), @(1, 1))) {
          $nx = $px + $d[0]; $ny = $py + $d[1]
          if ($nx -lt 0 -or $ny -lt 0 -or $nx -ge $w -or $ny -ge $h) { continue }
          $nb = $ny * $stride + $nx * 4
          if ($bytes[$nb + 3] -lt 8) { $touchClear = $true; break }
        }
        if (-not $touchClear) { continue }
        $bytes[$bi] = 0; $bytes[$bi + 1] = 0; $bytes[$bi + 2] = 0; $bytes[$bi + 3] = 0
        $peel = $true
      }
    }
  }
}

if ($AlignFoot) {
  function Get-SkylineFootRow {
    for ($y = $h - 1; $y -ge [Math]::Max(0, $h - 240); $y--) {
      $opaque = 0
      for ($x = 0; $x -lt $w; $x++) {
        if ($bytes[$y * $stride + $x * 4 + 3] -gt 40) { $opaque++ }
      }
      if ($opaque -gt [int]($w * 0.055)) { return $y }
    }
    return $h - 1
  }
  $footY = Get-SkylineFootRow
  $targetFoot = $h - 1 - $FootMargin
  $shift = $targetFoot - $footY
  Write-Host ("align foot row {0} -> {1} (shift {2})" -f $footY, $targetFoot, $shift)
  if ($shift -ne 0) {
    $shifted = New-Object byte[] ($stride * $h)
    for ($i = 0; $i -lt $shifted.Length; $i++) { $shifted[$i] = 0 }
    for ($dy = 0; $dy -lt $h; $dy++) {
      $sy = $dy - $shift
      if ($sy -lt 0 -or $sy -ge $h) { continue }
      [Array]::Copy($bytes, $sy * $stride, $shifted, $dy * $stride, $stride)
    }
    $bytes = $shifted
    $shiftedSrc = New-Object byte[] ($stride * $h)
    for ($i = 0; $i -lt $shiftedSrc.Length; $i++) { $shiftedSrc[$i] = 0 }
    for ($dy = 0; $dy -lt $h; $dy++) {
      $sy = $dy - $shift
      if ($sy -lt 0 -or $sy -ge $h) { continue }
      [Array]::Copy($sourceBytes, $sy * $stride, $shiftedSrc, $dy * $stride, $stride)
    }
    $sourceBytes = $shiftedSrc
  }
}

if ($Mode -eq 'SkyColumn') {
  function Has-ReachClearPost([int]$px, [int]$py, [int]$reach) {
    for ($dy = -$reach; $dy -le $reach; $dy++) {
      for ($dx = -$reach; $dx -le $reach; $dx++) {
        if (($dx * $dx + $dy * $dy) -gt ($reach * $reach)) { continue }
        $nx = $px + $dx; $ny = $py + $dy
        if ($nx -lt 0 -or $ny -lt 0 -or $nx -ge $w -or $ny -ge $h) { continue }
        if ($bytes[$ny * $stride + $nx * 4 + 3] -lt 8) { return $true }
      }
    }
    return $false
  }
  # Restore building pixels punched by overly-wide pocket flood.
  $yLo = [int]($h * 0.18)
  $yHi = [int]($h * 0.84)
  $restored = 0
  for ($py = $yLo; $py -lt $yHi; $py++) {
    for ($px = 0; $px -lt $w; $px++) {
      $bi = $py * $stride + $px * 4
      if ($bytes[$bi + 3] -gt 28) { continue }
      $solid = 0
      foreach ($d in @(@(-1, 0), @(1, 0), @(0, -1), @(0, 1))) {
        $nx = $px + $d[0]; $ny = $py + $d[1]
        if ($nx -lt 0 -or $ny -lt 0 -or $nx -ge $w -or $ny -ge $h) { continue }
        if ($bytes[$ny * $stride + $nx * 4 + 3] -gt 200) { $solid++ }
      }
      if ($solid -lt 3) { continue }
      if ((Get-BackdropDistAt $sourceBytes $bi) -le ($Floor + 6)) { continue }
      $bytes[$bi] = $sourceBytes[$bi]
      $bytes[$bi + 1] = $sourceBytes[$bi + 1]
      $bytes[$bi + 2] = $sourceBytes[$bi + 2]
      $bytes[$bi + 3] = 255
      $restored++
    }
  }
  Write-Host ("restored interior holes: {0}" -f $restored)

  # Salmon-red spire triangles — peel only thin halos touching transparency.
  $spireMax = [int]($h * 0.36)
  $spireClear = 0
  for ($pass = 0; $pass -lt 8; $pass++) {
    $any = $false
    for ($py = 0; $py -le $spireMax; $py++) {
      for ($px = 0; $px -lt $w; $px++) {
        $bi = $py * $stride + $px * 4
        if ($bytes[$bi + 3] -lt 8) { continue }
        $r = [double]$bytes[$bi + 2]; $g = [double]$bytes[$bi + 1]; $b = [double]$bytes[$bi]
        $d = (Get-BackdropDistAt $bytes $bi)
        $redHalo = ($d -le ($Floor + 8)) -or (
          $d -le 92 -and ($r - $g) -gt 48 -and ($r - $b) -gt 42 -and $r -gt 155
        )
        if (-not $redHalo) { continue }
        if (-not (Has-ReachClearPost $px $py 1)) { continue }
        $bytes[$bi] = 0; $bytes[$bi + 1] = 0; $bytes[$bi + 2] = 0; $bytes[$bi + 3] = 0
        $spireClear++
        $any = $true
      }
    }
    if (-not $any) { break }
  }
  Write-Host ("spire halo cleared: {0}" -f $spireClear)

  # Drop tiny floating fragments above the mid skyline.
  $visO = New-Object bool[] ($w * $h)
  $orphanMaxY = [int]($h * 0.62)
  $orphanMinY = [int]($h * 0.12)
  $orphanClear = 0
  for ($idx = 0; $idx -lt ($w * $h); $idx++) {
    if ($visO[$idx]) { continue }
    $py = [Math]::Floor($idx / $w)
    $px = $idx % $w
    $bi = $py * $stride + $px * 4
    if ($bytes[$bi + 3] -lt 40) { continue }
    $qO = New-Object System.Collections.Generic.Queue[int]
    $visO[$idx] = $true
    $qO.Enqueue($idx)
    $cells = @($idx)
    while ($qO.Count -gt 0) {
      $ci2 = $qO.Dequeue()
      $cy = [Math]::Floor($ci2 / $w)
      $cx = $ci2 % $w
      foreach ($d in @(@(-1, 0), @(1, 0), @(0, -1), @(0, 1))) {
        $nx = $cx + $d[0]; $ny = $cy + $d[1]
        if ($nx -lt 0 -or $ny -lt 0 -or $nx -ge $w -or $ny -ge $h) { continue }
        $ni = $ny * $w + $nx
        if ($visO[$ni]) { continue }
        $nb = $ny * $stride + $nx * 4
        if ($bytes[$nb + 3] -lt 40) { continue }
        $visO[$ni] = $true
        $qO.Enqueue($ni)
        $cells += $ni
      }
    }
    if ($cells.Count -gt 320) { continue }
    $minCY = 9999; $maxCY = -1
    foreach ($ci2 in $cells) {
      $cy = [Math]::Floor($ci2 / $w)
      if ($cy -lt $minCY) { $minCY = $cy }
      if ($cy -gt $maxCY) { $maxCY = $cy }
    }
    if ($minCY -lt $orphanMinY -or $maxCY -gt $orphanMaxY) { continue }
    foreach ($ci2 in $cells) {
      $cy = [Math]::Floor($ci2 / $w)
      $cx = $ci2 % $w
      $nb = $cy * $stride + $cx * 4
      $bytes[$nb] = 0; $bytes[$nb + 1] = 0; $bytes[$nb + 2] = 0; $bytes[$nb + 3] = 0
      $orphanClear++
    }
  }
  Write-Host ("orphan fragments cleared: {0}" -f $orphanClear)
}

$minX = $w; $maxX = -1; $minY = $h; $maxY = -1
for ($y = 0; $y -lt $h; $y++) {
  $row = $y * $stride
  for ($x = 0; $x -lt $w; $x++) {
    $i = $row + $x * 4
    if ($bytes[$i + 3] -gt 38) {
      if ($x -lt $minX) { $minX = $x }
      if ($x -gt $maxX) { $maxX = $x }
      if ($y -lt $minY) { $minY = $y }
      if ($y -gt $maxY) { $maxY = $y }
    }
  }
}

$cw = $maxX - $minX + 1
$ch = $maxY - $minY + 1
if ($NoTrim) {
  $minX = 0; $maxX = $w - 1; $minY = 0; $maxY = $h - 1
  $cw = $w; $ch = $h
}
Write-Host ("subject bbox x {0}..{1}  y {2}..{3}  ({4}x{5})" -f $minX, $maxX, $minY, $maxY, $cw, $ch)

if ($NoTrim) {
  $dst = New-Object System.Drawing.Bitmap $w, $h, ([System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
  $drect = New-Object System.Drawing.Rectangle 0, 0, $w, $h
  $ddata = $dst.LockBits($drect, [System.Drawing.Imaging.ImageLockMode]::WriteOnly,
    [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
  $dbytes = New-Object byte[] ($ddata.Stride * $h)
  [Array]::Copy($bytes, 0, $dbytes, 0, $bytes.Length)
  [System.Runtime.InteropServices.Marshal]::Copy($dbytes, 0, $ddata.Scan0, $dbytes.Length)
  $dst.UnlockBits($ddata)
  $dst.Save((Join-Path (Get-Location) $Out), [System.Drawing.Imaging.ImageFormat]::Png)
  $dst.Dispose()
}
else {
  $dst = New-Object System.Drawing.Bitmap $cw, $ch, ([System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
  $drect = New-Object System.Drawing.Rectangle 0, 0, $cw, $ch
$ddata = $dst.LockBits($drect, [System.Drawing.Imaging.ImageLockMode]::WriteOnly,
  [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$dbytes = New-Object byte[] ($ddata.Stride * $ch)
for ($y = 0; $y -lt $ch; $y++) {
  [Array]::Copy($bytes, ($minY + $y) * $stride + $minX * 4, $dbytes, $y * $ddata.Stride, $cw * 4)
}
[System.Runtime.InteropServices.Marshal]::Copy($dbytes, 0, $ddata.Scan0, $dbytes.Length)
$dst.UnlockBits($ddata)
$dst.Save((Join-Path (Get-Location) $Out), [System.Drawing.Imaging.ImageFormat]::Png)
$dst.Dispose()
}

Write-Host "row profile (y, leftmost, rightmost, width):"
for ($y = 0; $y -lt $ch; $y += [Math]::Max(1, [int]($ch / 42))) {
  $sy = $minY + $y
  $lo = -1; $hi = -1
  for ($x = $minX; $x -le $maxX; $x++) {
    if ($bytes[$sy * $stride + $x * 4 + 3] -gt 40) {
      if ($lo -lt 0) { $lo = $x }
      $hi = $x
    }
  }
  if ($lo -ge 0) { Write-Host ("  {0}`t{1}`t{2}`t{3}" -f $y, ($lo - $minX), ($hi - $minX), ($hi - $lo + 1)) }
}
