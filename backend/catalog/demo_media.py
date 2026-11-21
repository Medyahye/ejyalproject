"""Public sample media used for the demo lessons until teachers upload their own files."""

DEMO_VIDEOS = [
    'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
    'https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/360/Big_Buck_Bunny_360_10s_1MB.mp4',
    'https://test-videos.co.uk/vids/jellyfish/mp4/h264/360/Jellyfish_360_10s_1MB.mp4',
    'https://download.samplelib.com/mp4/sample-10s.mp4',
]

# Hosts must allow embedding (no restrictive frame-ancestors / X-Frame-Options).
DEMO_PDFS = [
    'https://pdfobject.com/pdf/sample.pdf',
]


def demo_video(i):
    return DEMO_VIDEOS[i % len(DEMO_VIDEOS)]


def demo_pdf(i):
    return DEMO_PDFS[i % len(DEMO_PDFS)]
