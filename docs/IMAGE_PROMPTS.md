# Site image prompts — GPT-Image-2

Generation briefs for every slot in `src/lib/site-images.ts`. Upload the results
through **Admin → Media**, which writes them to Vercel Blob and swaps them in
without a deploy.

---

## 1. Why the last batch came back black

The prompts asked for it. Every scene brief in the previous version of this file
described the screens as *"dark and switched off"*, *"a plain dark grey surface
with no interface"*, *"blank"* — and set several of the rooms *"at night"* with
*"cool monitor glow as the only light source"*. The house-style block on top of
all of them asked for light that was *"soft and slightly cool"*.

`gpt-image-2` follows luminance instructions literally. When the subject of the
frame is a row of dark rectangles in a dim room, a near-black frame is a correct
reading of the brief.

There is a second, deeper problem with that approach. Asking for a blank screen
fights the model instead of steering it: it has a very strong prior that a
monitor in a photograph is showing something, so it either fills the screen with
invented, garbled UI or crushes it to black to satisfy "blank". The old file
tried to solve the garbled-UI half by asking for absence, and got the black half
instead.

**The fix is to stop asking for absence and start supplying presence.** We now
have a real screenshot of the product in use. Attach it as a reference image and
tell the model to put *that* on the screen. Then light the room properly.

Two rules follow from this, and they apply to every prompt below:

1. **Never describe a screen as dark, off, blank, or empty.** Say what is on it,
   and say it comes from the reference image.
2. **State the exposure.** Every brief names a bright, evenly lit room and says
   so explicitly, because the model needs permission to make a bright picture of
   software, which it otherwise associates with dim rooms.

---

## 2. The two reference images

### `references.png` — a real client's EC-Share session

`web/references.png`, 1049 × 1050. This is the only legitimate source of our
interface. Nothing else in this file should ever ask the model to invent it.

What it shows, for when you need to describe it in words rather than attach it:

- A very dark application shell, near-black at `#070C0E` on the canvas and
  `#0C1316` in the sidebar, with one bright mint-teal accent at `#00E5CC`.
- A narrow left sidebar with six items — 儀表板, 連接, 裝置, 傳輸, 設定, 關於 —
  the first one active with a teal bar down its left edge. A green dot and
  "10 台連線中" pinned at the bottom.
- A thin status strip along the top: 10 線上, 0 離線, 88 ms 延遲, 0 隱藏中,
  divided by hairline rules. Below it a red-outlined 中斷連接 button, a 5×2 grid
  selector, and a record dot.
- A 5 × 2 grid of ten live Android phone views, each in its own tile with a
  hairline title bar, the phone's real status bar (04:46, 84% battery), and an
  Android navigation bar at the bottom.
- Inside each phone: a large white-outlined square holding one big white numeral
  (1 through 9, then X), a white pin-shaped glyph, a row of small app icons, and
  a wordmark in large white letters.

**Two cautions before this goes near the public site.** The phone contents are a
client's real device set — a client wordmark, plus AlipayHK, v2rayNG, 源计划 and
GPS Setter icons. Either keep the screen small enough in frame that none of it is
readable, or make a sanitised copy first (`references-clean.png`) with the
wordmark and app labels replaced by our own placeholder icons, and reference that
instead. Second, it is nearly square, so it does not fill a widescreen monitor:
either say the grid fills the screen with our own dark chrome extending to either
side, or accept a letterboxed look and say so.

### `ec-share_logo.png` — the real app icon

`web/ec-share_logo.png`, 500 × 500. Flat, two colours, no gradients:

- A squircle tile in mid-teal `#57BCB2`, with a second identical tile offset
  behind it to the right and below in darker teal `#4A9C94`, so the mark reads as
  one card stacked on another.
- On the tile, in charcoal `#2A323D`: a short rounded horizontal bar near the top
  edge, and below it a wide almond eye shape with a circular pupil. The pupil has
  a small teal circle bitten out of its upper right, which reads as a highlight.
- No text, no bevel, no drop shadow.

**Do not generate this slot.** The `ecShareAppIcon` slot below used to have a
prompt for inventing an icon; that was only ever a stand-in. Upload this file.

---

## 3. How to attach a reference image

Reference images go through `/v1/images/edits`, not `/v1/images/generations`.
Repeat the `image` field once per reference; upload order is what "image 1" and
"image 2" mean in the prompt.

```bash
curl -X POST "https://api.openai.com/v1/images/edits" \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -F "model=gpt-image-2" \
  -F "size=2560x1440" \
  -F "quality=high" \
  -F "image=@references-clean.png" \
  -F "prompt=<the brief, referring to 'image 1'>"
```

The Python equivalent takes a list:

```python
client.images.edit(
    model="gpt-image-2",
    image=[open("references-clean.png", "rb")],
    prompt=brief,
    size="2560x1440",
    quality="high",
)
```

Things that will bite:

- **Do not pass `input_fidelity`.** `gpt-image-2` always processes inputs at high
  fidelity and rejects the parameter with a 400.
- Up to 16 reference images per request, but every one is billed as image input
  tokens at high fidelity, so send the fewest that do the job and downscale each
  to roughly the size it will occupy in the output. Keep each file under ~1.5 MB;
  large multipart bodies fail at the gateway more often than they succeed.
- Test each brief once at `1024x1024` and `quality=low` before spending two
  minutes and full price on a 4K `high` call.

---

## 4. Model constraints

`gpt-image-2` takes an arbitrary `size` string, but it must satisfy all of:

| Rule | Value |
| --- | --- |
| Max edge | ≤ 3840 px |
| Both edges | multiples of 16 |
| Long : short ratio | ≤ 3 : 1 |
| Total pixels | 655,360 – 8,294,400 |
| Above 2560×1440 | officially experimental, quality varies |

Also:

- **No transparent background.** `background: "transparent"` errors on this
  model. Not a problem any more, since the one slot that needed transparency is
  now the real icon file.
- `quality: "high"`, `output_format: "png"` for anything `next/image` will
  re-compress anyway.
- Chinese prompts work natively, but these briefs are in English because the
  scene vocabulary ("device rack", "regression pass") is understood more
  precisely that way. The *people* should be Hong Kong Chinese — say so, or you
  get a generic Californian office.

---

## 5. House style

They appear within two screens of each other, so a warm stock-photo boardroom
next to a cold documentary desk reads as a mistake. Prepend this to every brief:

```
Photographic, documentary style, bright and evenly exposed. A well-lit room
during the day: large windows, daylight filling the space, mid-tone exposure
with open shadows and no crushed blacks. Neutral palette of warm greys,
off-white walls and light wood, with a single teal accent somewhere small in
frame. Real desks with real wear: cables, a mug, a notebook. Moderate depth of
field, the screen in focus. No lens flare, no HDR, no glossy stock-photo
finish, no brand logos on furniture or clothing, and no invented lettering
anywhere in the image. Shot on a 35mm lens at f/4. Hong Kong, Chinese
subjects.
```

Note `f/4` rather than `f/2.8`: at f/2.8 the model throws the screen out of
focus, which defeats the point of attaching a screenshot in the first place.

---

## 6. Slot by slot

### `ecShareAppIcon` — app icon
**Where** Product page, beside the headline, at 160 px with rounded corners.
**Do not generate.** Upload `web/ec-share_logo.png`. Section 2 describes it if
you ever need it drawn into a scene as a secondary reference.

### `ecShareHero` — the wide plate, and scene 1
**Where** Product hero (cropped **21:9**), product scenes, and the lead case
study on the services page (cropped **4:3**).
**Size** `2560x1440`. **Attach** image 1 = the sanitised screenshot.
**Careful** One file, cropped three ways, from very wide to almost square. Keep
the monitor and the phones inside the central 4:3 area or the services page cuts
the subject off.

```
Over-the-shoulder view of one person at a desk in a bright office during the
day, seen from behind their right shoulder. On the large widescreen monitor in
front of them, reproduce the application interface from image 1 exactly: the
dark shell with its narrow left sidebar, the thin status strip along the top,
and the grid of ten small Android phone views filling the main area. Extend the
interface's own dark background to fill the full width of the widescreen panel.
On the desk in front of the monitor, eight Android phones lie flat in two neat
rows, face up, each showing the same bright numbered test screen that appears in
the phone views on the monitor. Short USB cables run from the phones to a hub.
The person's hand rests on a mouse. Daylight from a window to the left. Centred
composition, monitor and phones both in the middle third of the frame.
```

### `ecShareSceneTogether` — scene 2, "watching it together"
**Where** Product scenes, cropped **3:4** portrait.
**Size** `1536x2048`. **Attach** image 1 = the sanitised screenshot.

```
A bright living room in the late afternoon, two people sitting side by side on a
sofa, seen from slightly behind and above. On the low table in front of them, an
open laptop shows the application interface from image 1, reduced to two large
Android phone views side by side in the main area, with the same dark sidebar and
top status strip. Two phones lie on the table beside the laptop, screens facing
up and lit, connected by thin cables. Daylight through a large window, warm and
open, with a lamp on in the corner. Relaxed posture, one of them pointing at the
laptop screen. Vertical composition, the laptop screen clearly legible in the
lower half of the frame.
```

### `ecShareSceneQueue` — scene 3, "the minute tickets go on sale"
**Where** Product scenes, cropped **3:4** portrait.
**Size** `1536x2048`. **Attach** image 1 = the sanitised screenshot.
**Careful** This one used to be set at night, which is where the black frames
came from. The tension now comes from posture and the clock, not from darkness.

```
Close, slightly high view of a desk in a bright room. Three Android phones stand
upright in small stands in a row, all three screens on and showing the same
bright numbered test screen, each connected by a short cable to a hub. Behind
them, a monitor shows the application interface from image 1 with three phone
views in its main area. A hand rests on a mouse to the right, a watch on the
wrist. Slight motion blur on the hand only. Daylight from the side, evenly
exposed, no dramatic shadows. Focused and hurried, not dark. Vertical
composition, the three phones filling the middle of the frame.
```

### `ecShareGalleryRemote` — scene 4, "fixing a phone for family"
**Where** Product scenes, cropped **16:9**.
**Size** `2048x1152`. **Attach** image 1 = the sanitised screenshot.
**Careful** This is a one-device scene, so image 1 is a *style* reference here,
not something to reproduce literally. The prompt says so explicitly — otherwise
you get a ten-phone grid in a story about one phone.

```
Two people at a home desk in daylight: an adult in their thirties seated at a
keyboard, an older parent standing beside them leaning in to watch. A single
phone lies on the desk connected by a cable, its screen on. The monitor in front
of them shows the same application as image 1 — take the dark shell, the narrow
left sidebar, the top status strip and the mint-teal accent from image 1 — but
showing one single enlarged portrait phone view centred in the main area instead
of a grid. Both are looking at the monitor, not at the phone. Domestic setting, a
bookshelf softly out of focus behind, window light from the right. Patient,
unhurried mood, bright and evenly exposed.
```

### `ecShareGalleryLab` — scene 5, "a rack running regressions"
**Where** Product scenes, cropped **4:3**.
**Size** `2048x1536`. **Attach** image 1 = the sanitised screenshot.
**Careful** The best fit for the screenshot as-is: a twelve-phone rack next to a
ten-phone grid needs no adaptation.

```
A device test rack in a small engineering office, lit by fluorescent ceiling
light and daylight from a window. Ten Android phones mounted in a metal frame in
two tidy rows of five, every screen on and showing a bright numbered test screen,
each wired with a labelled cable running down to a powered hub at the base.
Beside the rack, a monitor reproduces the application interface from image 1
exactly, its grid of ten phone views matching the ten phones in the rack
one-for-one. Nobody in frame. Clinical but lived-in, cables tied but not
perfect. Bright, evenly exposed, no crushed shadows.
```

### `ecShareSceneRoom` — scene 6, "showing the room the real thing"
**Where** Product scenes, cropped **4:3**.
**Size** `2048x1536`. **Attach** image 1 = the sanitised screenshot.

```
A small meeting room of five or six people around a table, seen from the back of
the room. The wall-mounted display at the far end shows the application interface
from image 1: the dark shell, the left sidebar, the top status strip, and a grid
of Android phone views, scaled up so the display is the brightest thing in the
frame. One person stands beside the display mid-sentence, the others watching,
two with open laptops. A phone sits on the table connected to a laptop by a
cable. Glass partition wall with city daylight behind it, the room bright enough
that faces are clearly lit. A working meeting, not a boardroom presentation.
```

### `servicesHero` — the full-bleed band
**Where** Services page, full viewport width, taking whatever height the fold
leaves, so the effective crop is very wide and shallow.
**Size** `2560x1088` (2.35:1). `3360x1440` also validates but is above the
experimental threshold. **No reference** — this is the studio, not the product.
**Careful** Nothing sits over it, so the centre carries the picture and the outer
thirds get cropped on narrow screens.

```
Wide panoramic view across two desks in a small bright studio, shot at desk
height. A designer at one desk with a large monitor showing a light-grey layout
wireframe: rectangles, placeholder image blocks and grey bars standing in for
text, no actual lettering. An engineer at the second desk with two monitors
showing a light code editor, again with grey bars instead of readable text.
Between them, a printed layout sheet and a notebook of hand-drawn wireframes,
legible as drawings but with no words. Plants, a window with city rooftops,
daylight filling the room. Both figures partly cut off at the edges of the frame.
Panoramic composition, the notebook and printed sheet in the centre.
```

### `servicesCaseWeb` — case study 2, "full-stack management platform"
**Where** Services page, second case study, cropped **16:9**.
**Size** `2048x1152`. **No reference.**
**Careful** Ask for a light-background dashboard, described as blocks and shapes
rather than words. The old brief's "plain dark surfaces" is what turned this one
into two black rectangles.

```
A laptop and an external monitor on a clean light desk, angled three-quarters to
the camera, no person in frame. Both screens show a light dashboard interface:
white background, a simple line chart, two rows of summary cards, and grey bars
standing in for labels — shapes only, no readable lettering anywhere. Beside the
keyboard, a card reader, a paper invoice and a pen. Bright morning light from the
left, a coffee cup casting a long soft shadow. Quiet, orderly, early-morning
mood, evenly exposed.
```

### `servicesCaseDesign` — case study 3, "dark/light design system"
**Where** Services page, third case study, cropped **16:9**.
**Size** `2048x1152`. **No reference.**
**Careful** The one brief that legitimately contains a dark half. Say the dark
half is a *printed near-black*, exposed so its paper texture is visible, or the
model returns half a frame of pure black.

```
Overhead flat-lay of a light wooden desk in daylight. Two printed sheets side by
side: one on white paper, one on near-black paper photographed so the ink and
paper texture stay clearly visible rather than going solid black. Both show the
same grid of empty rectangles and swatch squares, no readable text. A colour fan
deck open beside them, a pencil, a phone lying face down. Even soft overhead
light, minimal shadow. Half the frame light and half dark, so the pairing itself
is the subject, both halves properly exposed.
```

---

## 7. After generating

1. Check the returned file's real dimensions before treating a 4K request as 4K.
2. Look at the screen in every scene. If the model has invented lettering inside
   the interface, regenerate rather than shipping it — garbled UI text is the
   single most obvious tell. If it is close but the text is soft, compositing the
   real screenshot into the monitor by hand still beats another generation.
3. Convert to JPEG at ~82% quality for photographs. `next/image` produces AVIF
   and WebP from whatever is uploaded, so the source only needs to be larger than
   the largest rendered size, not enormous.
4. Upload at **Admin → Media**. Each card states the slot's crop and every
   placement it feeds, so check the shape note there before uploading.
