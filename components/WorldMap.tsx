'use client';

import 'leaflet/dist/leaflet.css';
import type { Feature, FeatureCollection, Geometry } from 'geojson';
import type { Layer, LeafletMouseEvent, PathOptions } from 'leaflet';
import { useEffect, useMemo, useState } from 'react';
import { GeoJSON, MapContainer, TileLayer } from 'react-leaflet';

type DwaparaProperties = {
  ADMIN?: string;
  NAME_LONG?: string;
  SOVEREIGNT?: string;
  DWAPARA_NAME?: string;
  [key: string]: unknown;
};

type DwaparaFeature = Feature<Geometry, DwaparaProperties>;
type DwaparaFeatureCollection = FeatureCollection<Geometry, DwaparaProperties>;

const defaultStyle: PathOptions = {
  color: '#38bdf8',
  weight: 1,
  fillColor: '#0ea5e9',
  fillOpacity: 0.22
};

const hoverStyle: PathOptions = {
  ...defaultStyle,
  weight: 2.5,
  fillOpacity: 0.38
};

const dwaparaLookup = new Map<string, string>([
  ['India', 'Bharata Khanda'],
  ['Sri Lanka', 'Lanka'],
  ['Pakistan', 'Gandhara'],
  ['Afghanistan', 'Kamboja'],
  ['Bangladesh', 'Vanga'],
  ['Nepal', 'Kirati Realm'],
  ['Bhutan', 'Druk Yul'],
  ['China', 'Mleccha Orient'],
  ['Myanmar', 'Suvannabhumi'],
  ['Thailand', 'Nagadipa'],
  ['Laos', 'Ravana-gahvara'],
  ['Cambodia', 'Kambuja Desa'],
  ['Vietnam', 'Uluka Province'],
  ['Indonesia', 'Dvipa Archipelago'],
  ['Malaysia', 'Surparaka Reach'],
  ['Singapore', 'Temasek Dvipa'],
  ['Japan', 'Yamato Isles'],
  ['Mongolia', 'Huna Steppe'],
  ['Russia', 'Uttara Kuru'],
  ['Kazakhstan', 'Saka Plateau'],
  ['Uzbekistan', 'Tushara Realm'],
  ['Turkmenistan', 'Parama Kamboja'],
  ['Iran', 'Parsava Kingdom'],
  ['Iraq', 'Madra Basin'],
  ['Syria', 'Aratta Frontier'],
  ['Turkey', 'Pahlava Reach'],
  ['Egypt', 'Misra Desh'],
  ['Ethiopia', 'Habesha Janapada'],
  ['Somalia', 'Barbarika Coast'],
  ['Kenya', 'Shakulya Plains'],
  ['Tanzania', 'Matanga Plateau'],
  ['South Africa', 'Hrasva Dwipa'],
  ['United States of America', 'Pushkara Continent'],
  ['Canada', 'Uttara Pushkara'],
  ['Mexico', 'Maya Khanda'],
  ['Brazil', 'Nila Varsha'],
  ['Argentina', 'Hemanta Varsha'],
  ['Peru', 'Garuda Andes'],
  ['Chile', 'Sarpa Valley'],
  ['Bolivia', 'Yaksha Highlands'],
  ['Colombia', 'Kartika Basin'],
  ['Venezuela', 'Bhaga Canopy'],
  ['United Kingdom', 'Svarnadvipa Isles'],
  ['France', 'Sindhuvisha Territory'],
  ['Spain', 'Nagavanshi Coast'],
  ['Portugal', 'Ratnakara Gate'],
  ['Germany', 'Daityan Foothold'],
  ['Italy', 'Vanara Peninsula'],
  ['Greece', 'Yavana Polis'],
  ['Poland', 'Kuru Outlands'],
  ['Ukraine', 'Sindhava Plains'],
  ['Belarus', 'Vasati Corridor'],
  ['Norway', 'Deva Fjords'],
  ['Sweden', 'Yaksha Tundra'],
  ['Finland', 'Marut Tundra'],
  ['Iceland', 'Shveta Dvipa'],
  ['Greenland', 'Airavata Glacier'],
  ['Saudi Arabia', 'Arabia Khanda'],
  ['United Arab Emirates', 'Ratna Port'],
  ['Qatar', 'Śankha Harbor'],
  ['Bahrain', 'Nagadipa Pearl'],
  ['Oman', 'Sagara Gate'],
  ['Yemen', 'Sabha Coast'],
  ['Israel', 'Shurasena Corridor'],
  ['Jordan', 'Nishada Marches'],
  ['Lebanon', 'Vanara Ridge'],
  ['Morocco', 'Ketumala Coast'],
  ['Algeria', 'Ruru Expanse'],
  ['Tunisia', 'Sudarshana Bend'],
  ['Libya', 'Gandhara West'],
  ['Sudan', 'Kush Desh'],
  ['South Sudan', 'Shalya March'],
  ['Chad', 'Yaksha Sands'],
  ['Niger', 'Rishika Dunes'],
  ['Mali', 'Bhima Basin'],
  ['Nigeria', 'Anarta Delta'],
  ['Ghana', 'Kuruvarsha'],
  ['Ivory Coast', 'Duhkha Shore'],
  ['Cameroon', 'Rakshasa Wilds'],
  ['Democratic Republic of the Congo', 'Naga Rainforest'],
  ['Republic of the Congo', 'Naga Littoral'],
  ['Angola', 'Ketu Savannah'],
  ['Namibia', 'Pampa Estuary'],
  ['Botswana', 'Sattva Plains'],
  ['Zimbabwe', 'Shiva Plateau'],
  ['Mozambique', 'Sagara Estuary'],
  ['Madagascar', 'Mahodaya Isle'],
  ['Australia', 'Ajagara Continent'],
  ['New Zealand', 'Sura Isles'],
  ['Papua New Guinea', 'Yakshini Archipelago'],
  ['Philippines', 'Nagapattinam Isles'],
  ['South Korea', 'Agnivanshi Peninsula'],
  ['North Korea', 'Prachya March'],
  ['Bhutan', 'Druk Yul'],
  ['Iceland', 'Shveta Dvipa']
]);

function enrichDataset(collection: DwaparaFeatureCollection): DwaparaFeatureCollection {
  const features = collection.features.map((feature) => {
    const modernName =
      feature.properties?.NAME_LONG ??
      feature.properties?.ADMIN ??
      feature.properties?.SOVEREIGNT ??
      'Unknown Realm';
    const dwaparaName = dwaparaLookup.get(modernName) ?? modernName;

    return {
      ...feature,
      properties: {
        ...feature.properties,
        DWAPARA_NAME: dwaparaName,
        MODERN_NAME: modernName
      }
    };
  });

  return { ...collection, features };
}

export default function WorldMap() {
  const [dataset, setDataset] = useState<DwaparaFeatureCollection | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    let isSubscribed = true;

    async function loadDataset() {
      try {
        const response = await fetch('/data/dwapara.geojson');
        if (!response.ok) {
          throw new Error(`Failed to load dataset: ${response.statusText}`);
        }

        const raw = (await response.json()) as DwaparaFeatureCollection;
        if (isSubscribed) {
          setDataset(enrichDataset(raw));
        }
      } catch (err) {
        if (isSubscribed) {
          setError(err instanceof Error ? err.message : 'Unknown error while loading dataset');
        }
      }
    }

    void loadDataset();

    return () => {
      isSubscribed = false;
    };
  }, []);

  const featureStyle = useMemo(() => defaultStyle, []);

  if (!isMounted) {
    return (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'grid',
          placeItems: 'center',
          background: 'rgba(15, 23, 42, 0.6)',
          color: '#94a3b8'
        }}
      >
        Initializing astral projection&hellip;
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'grid',
          placeItems: 'center',
          background: 'rgba(127, 29, 29, 0.2)',
          color: '#fecaca',
          padding: '1.5rem',
          textAlign: 'center'
        }}
      >
        {error}
      </div>
    );
  }

  if (!dataset) {
    return (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'grid',
          placeItems: 'center',
          background: 'rgba(15, 23, 42, 0.6)',
          color: '#94a3b8'
        }}
      >
        Loading cartography&hellip;
      </div>
    );
  }

  const handleFeatureHover = (event: LeafletMouseEvent) => {
    const target = event.target;
    target.setStyle(hoverStyle);
  };

  const handleFeatureLeave = (event: LeafletMouseEvent) => {
    const target = event.target;
    target.setStyle(featureStyle);
  };

  const handleEachFeature = (feature: DwaparaFeature, layer: Layer) => {
    const dwaparaName = feature.properties?.DWAPARA_NAME ?? 'Unnamed Dominion';
    const modernName = feature.properties?.MODERN_NAME ?? dwaparaName;
    const tooltipLines = [dwaparaName];

    if (modernName !== dwaparaName) {
      tooltipLines.push(`Modern: ${modernName}`);
    }

    layer.bindTooltip(tooltipLines.join('\n'), {
      sticky: true,
      direction: 'auto',
      opacity: 0.9,
      className: 'dwapara-tooltip'
    });

    layer.on({
      mouseover: handleFeatureHover,
      mouseout: handleFeatureLeave
    });
  };

  return (
    <MapContainer
      center={[20.5937, 78.9629]}
      zoom={3}
      minZoom={2}
      maxZoom={8}
      scrollWheelZoom
      style={{ width: '100%', height: '100%', background: '#020617' }}
      preferCanvas
      attributionControl={false}
    >
      <TileLayer
        url="https://tile.jawg.io/jawg-dark/{z}/{x}/{y}{r}.png?access-token=5VJZZGkau8keqLsAh-qrb-ZVYVP6CEbnNZzqe22HCpVbRYWtTfQEB8Qwh2DS2vL8"
        attribution='&copy; <a href="https://www.jawg.io" target="_blank" rel="noreferrer">Jawg Maps</a> contributors'
      />
      <GeoJSON data={dataset} style={() => featureStyle} onEachFeature={handleEachFeature} />
    </MapContainer>
  );
}
