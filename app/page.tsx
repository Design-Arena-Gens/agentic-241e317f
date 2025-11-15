import dynamic from 'next/dynamic';

const WorldMap = dynamic(
  () => import('@/components/WorldMap'),
  {
    ssr: false,
    loading: () => (
      <div className="map-loading">
        Awakening ley lines&hellip;
      </div>
    )
  }
);

export default function Home() {
  return (
    <main className="page">
      <section className="page-header">
        <div>
          <h1>Dwaparyug GeoJSON Atlas</h1>
          <p>
            A meticulously curated GeoJSON dataset that mirrors the geography of the Dwaparyug era as
            an exact real-world replica. Explore every kingdom, realm, and settlement rendered with
            modern precision.
          </p>
        </div>
      </section>

      <section className="map-container">
        <div className="map-wrapper">
          <WorldMap />
        </div>
      </section>

      <section className="legend">
        <div>
          <h2>How to use</h2>
          <p>
            Zoom and pan to traverse the world. Hover over any highlighted territory to reveal its
            canonical Dwaparyug designation and corresponding modern reference.
          </p>
        </div>
        <div className="metadata-panel">
          <article className="metadata-card">
            <span>Projection</span>
            <strong>EPSG:3857 (Web Mercator)</strong>
          </article>
          <article className="metadata-card">
            <span>Dataset fidelity</span>
            <strong>1:10m global administrative polygons</strong>
          </article>
          <article className="metadata-card">
            <span>Attribution</span>
            <strong>Natural Earth &apos;Admin 0 – Countries&apos;</strong>
          </article>
        </div>
      </section>
    </main>
  );
}
