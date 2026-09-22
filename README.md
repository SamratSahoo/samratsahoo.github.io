# samratsahoo.com

My personal academic homepage, built with Jekyll and deployed to GitHub Pages by
`.github/workflows/build-jekyll.yml` on every push to `master`.

## Updating the homepage

| What | Where |
| --- | --- |
| Bio | `index.md` (Markdown) |
| Name, photo, profile links | `_data/profile.yml` |
| Papers | `_data/publications.yml` (newest first; field reference at the top of the file) |
| Co-author homepages | `_data/people.yml` (any author listed here is linked automatically) |

Paper thumbnails live in `assets/pubs/`: a 640×360 silent H.264 `.mp4` loop plus a
`.webp` poster of its first frame, or a `.webp`/`.jpg` figure pair for papers without
video. For example:

```sh
ffmpeg -i source.mp4 -an -vf "scale=640:360:force_original_aspect_ratio=increase,crop=640:360" \
  -c:v libx264 -crf 26 -preset slow -pix_fmt yuv420p -movflags +faststart assets/pubs/KEY.mp4
ffmpeg -i assets/pubs/KEY.mp4 -frames:v 1 -c:v libwebp -quality 80 assets/pubs/KEY.webp
```

## Layout

- `_layouts/home.html` and `_includes/publication.html` render the homepage.
- `_includes/site.css` holds all styles (inlined into every page; colors and fonts at the top).
- `assets/js/site.js` plays the clips while they're on screen, and toggles and copies BibTeX.
- Older pages (reading notes, lecture notes, writing, search) still build at their old URLs
  with the same styling; they just aren't linked from the homepage.

## Local development

```sh
bundle install
bundle exec jekyll serve --livereload
```
