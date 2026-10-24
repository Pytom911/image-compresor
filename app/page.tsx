
"use client";

import { useRef, useState } from "react";

const GITHUB_URL = "https://github.com/USERNAME/REPO";
const SAWERIA_URL = "https://saweria.co/USERNAME";

export default function Home() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [quality, setQuality] = useState(80);
  const [format, setFormat] = useState("image/webp");
  const [result, setResult] = useState<{
    url: string;
    size: number;
    name: string;
  } | null>(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");

  function handleFile(selected?: File) {
    if (!selected) return;

    if (!selected.type.startsWith("image/")) {
      setError("Pilih file gambar yang valid.");
      return;
    }

    if (selected.size > 20 * 1024 * 1024) {
      setError("Ukuran gambar maksimal 20 MB.");
      return;
    }

    setError("");
    setFile(selected);
    setPreview(URL.createObjectURL(selected));
    setResult(null);
  }

  async function compressImage() {
    if (!file || !preview) return;

    setProcessing(true);
    setError("");

    try {
      const image = new Image();
      image.src = preview;

      await new Promise<void>((resolve, reject) => {
        image.onload = () => resolve();
        image.onerror = () => reject(new Error("Gagal membaca gambar."));
      });

      const canvas = document.createElement("canvas");
      canvas.width = image.naturalWidth;
      canvas.height = image.naturalHeight;

      const context = canvas.getContext("2d");
      if (!context) throw new Error("Browser tidak mendukung Canvas.");

      context.drawImage(image, 0, 0);

      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
          (value) => {
            if (value) resolve(value);
            else reject(new Error("Gagal memproses gambar."));
          },
          format,
          quality / 100
        );
      });

      const url = URL.createObjectURL(blob);
      const extension = format === "image/webp" ? "webp" : "jpg";

      setResult({
        url,
        size: blob.size,
        name: `${file.name.replace(/\.[^.]+$/, "")}-compressed.${extension}`,
      });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Terjadi kesalahan."
      );
    } finally {
      setProcessing(false);
    }
  }

  function formatSize(bytes: number) {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  }

  const saved = file && result
    ? Math.round((1 - result.size / file.size) * 100)
    : 0;

  return (
    <main>
      <nav className="navbar">
        <a href="#" className="brand">
          <span className="brand-icon">P</span>
          <span>Pixel<span className="brand-light">Press</span></span>
        </a>

        <div className="nav-links">
          <a href="#features">Features</a>
          <a href="#compressor">Compressor</a>
          <a href="#about">About</a>
        </div>

        <a className="nav-cta" href="#compressor">
          Try it free <span>↗</span>
        </a>
      </nav>

      <section className="hero">
        <div className="hero-badge">
          <span className="status-dot" />
          Free image compression tool
        </div>

        <h1>
          Smaller images.
          <br />
          <span>Better web.</span>
        </h1>

        <p className="hero-description">
          Compress your images without the hassle.
          Smaller file sizes, faster websites, and more
          room for what matters.
        </p>

        <div className="hero-actions">
          <a href="#compressor" className="button-primary">
            Compress an image <span>→</span>
          </a>
          <span className="privacy-note">
            <span>✓</span> 100% browser-based
          </span>
        </div>

        <div className="hero-visual" id="compressor">
          <div className="editor-window">
            <div className="window-top">
              <div className="window-dots">
                <i /><i /><i />
              </div>
              <span className="window-title">Image workspace</span>
              <span className="secure-badge">✳ Private & secure</span>
            </div>

            <div className="workspace">
              <div className="upload-area">
                {!file ? (
                  <button
                    type="button"
                    className="upload-box"
                    onClick={() => inputRef.current?.click()}
                    onDragOver={(event) => event.preventDefault()}
                    onDrop={(event) => {
                      event.preventDefault();
                      handleFile(event.dataTransfer.files[0]);
                    }}
                  >
                    <span className="upload-icon">↑</span>
                    <strong>Drop your image here</strong>
                    <span className="muted">
                      or click to browse files
                    </span>
                    <span className="file-types">
                      JPG · PNG · WEBP · MAX 20 MB
                    </span>
                  </button>
                ) : (
                  <div
                    className="image-preview"
                    onDragOver={(event) => event.preventDefault()}
                    onDrop={(event) => {
                      event.preventDefault();
                      handleFile(event.dataTransfer.files[0]);
                    }}
                  >
                    <img src={preview} alt="Image preview" />
                    <div className="preview-caption">
                      <div>
                        <strong>{file.name}</strong>
                        <span>{formatSize(file.size)}</span>
                      </div>
                      <button
                        type="button"
                        className="text-button"
                        onClick={() => inputRef.current?.click()}
                      >
                        Change image
                      </button>
                    </div>
                  </div>
                )}

                <input
                  ref={inputRef}
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={(event) =>
                    handleFile(event.target.files?.[0])
                  }
                />

                <div className="privacy-card">
                  <span className="privacy-icon">♧</span>
                  <div>
                    <strong>Your images stay yours</strong>
                    <p>Files are processed locally in your browser.</p>
                  </div>
                  <span className="check-icon">✓</span>
                </div>
              </div>

              <aside className="settings-panel">
                <div className="settings-heading">
                  <div>
                    <span className="eyebrow">SETTINGS</span>
                    <h3>Compression</h3>
                  </div>
                  <span className="settings-icon">⚙</span>
                </div>

                <label className="field-label" htmlFor="format">
                  Output format
                </label>
                <select
                  id="format"
                  className="select-field"
                  value={format}
                  onChange={(event) => {
                    setFormat(event.target.value);
                    setResult(null);
                  }}
                >
                  <option value="image/webp">WebP · Recommended</option>
                  <option value="image/jpeg">JPEG</option>
                </select>

                <div className="quality-heading">
                  <label className="field-label" htmlFor="quality">
                    Image quality
                  </label>
                  <strong>{quality}%</strong>
                </div>
                <input
                  id="quality"
                  className="quality-slider"
                  type="range"
                  min="10"
                  max="100"
                  value={quality}
                  onChange={(event) => {
                    setQuality(Number(event.target.value));
                    setResult(null);
                  }}
                />
                <div className="range-labels">
                  <span>Smaller file</span>
                  <span>Higher quality</span>
                </div>

                <div className="quality-info">
                  <span>✦</span>
                  <p>
                    {quality < 50
                      ? "Higher compression, lower visual quality."
                      : quality < 80
                      ? "Balanced compression for everyday use."
                      : "Higher image quality with larger file sizes."}
                  </p>
                </div>

                <button
                  type="button"
                  className="compress-button"
                  onClick={compressImage}
                  disabled={!file || processing}
                >
                  {processing
                    ? "Compressing..."
                    : "Compress image  →"}
                </button>

                {error && <p className="error-message">{error}</p>}

                {result && file && (
                  <div className="result-card">
                    <span className="result-label">COMPRESSION RESULT</span>
                    <div className="result-stats">
                      <div>
                        <span>Original</span>
                        <strong>{formatSize(file.size)}</strong>
                      </div>
                      <div>
                        <span>Compressed</span>
                        <strong>{formatSize(result.size)}</strong>
                      </div>
                    </div>
                    <p className="saved-text">
                      {result.size < file.size
                        ? `${saved}% smaller`
                        : "File size increased"}
                    </p>
                    <a
                      href={result.url}
                      download={result.name}
                      className="download-button"
                    >
                      ↓ Download image
                    </a>
                  </div>
                )}

                <p className="no-upload">No account needed. No uploads.</p>
              </aside>
            </div>
          </div>

          <div className="floating-note note-left">
            <span className="note-icon">↘</span>
            <div>
              <strong>Less weight</strong>
              <span>Faster loading</span>
            </div>
          </div>

          <div className="floating-note note-right">
            <span className="note-icon green">✓</span>
            <div>
              <strong>Made simple</strong>
              <span>Just a few clicks</span>
            </div>
          </div>
        </div>
      </section>

      <section className="features-section" id="features">
        <div className="section-heading">
          <span className="eyebrow">WHY PIXELPRESS?</span>
          <h2>Everything you need. Nothing you don't.</h2>
          <p>Simple tools for better images and faster workflows.</p>
        </div>

        <div className="feature-grid">
          <article className="feature-card">
            <span className="feature-icon blue">↗</span>
            <h3>Smaller file sizes</h3>
            <p>Reduce image sizes to help your pages load faster.</p>
          </article>
          <article className="feature-card">
            <span className="feature-icon purple">⌘</span>
            <h3>Simple controls</h3>
            <p>Choose your format and quality in just a few clicks.</p>
          </article>
          <article className="feature-card">
            <span className="feature-icon green">♧</span>
            <h3>Private by design</h3>
            <p>Your images stay on your device during processing.</p>
          </article>
        </div>
      </section>

      <section className="support-section" id="about">
        <div>
          <span className="eyebrow">BUILT WITH CARE</span>
          <h2>Useful tools, made independently.</h2>
          <p>
            PixelPress is an independent project by PytomDev.
            If this tool helps you, support its development.
          </p>
        </div>
        <div className="support-actions">
          <a
            className="github-button"
            href={GITHUB_URL}
            target="_blank"
            rel="noreferrer"
          >
            ☆ Star on GitHub
          </a>
          <a
            className="coffee-button"
            href={SAWERIA_URL}
            target="_blank"
            rel="noreferrer"
          >
            ☕ Buy me a coffee
          </a>
        </div>
      </section>

      <footer className="footer">
        <a href="#" className="brand footer-brand">
          <span className="brand-icon">P</span>
          <span>Pixel<span className="brand-light">Press</span></span>
        </a>
        <p>Made with care by <a href="https://pytomdev.vercel.app/" target="_blank" rel="noreferrer">PytomDev</a></p>
        <span className="footer-note">Your images. Your device.</span>
      </footer>
    </main>
  );
}
