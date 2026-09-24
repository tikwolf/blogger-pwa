# Offline translation cache

The implementation is intentionally conservative: it stores translated text snapshots per page and language, while preserving the existing Blogger/Plus UI and excluding community SDK data. The cache is only used when the page is offline and a matching translated snapshot exists.
