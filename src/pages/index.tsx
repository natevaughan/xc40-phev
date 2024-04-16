import { useEffect, useRef, useState } from "react";

interface Dimensions {
  fullHeight: number;
  usableWidth: number;
  usableHeight: number;
}

interface Render {
  dimensions: Dimensions;
  max: number;
  ice: Stats;
  phev: Stats;
  bev: Stats;
}

interface Stats {
  x: number;
  y: number;
  label: string;
  total: number;
  rects: RenderedRect[];
}

interface RenderedRect {
  key: string;
  color: string;
  height: number;
  width: number;
  x: number;
  y: number;
}

export default function Home() {
  const elementRef = useRef(null);

  const colors = {
    materials: "#939392",
    manufacturing: "#567890",
    battery: "#768fb1",
    eol: "#2e2e2c",
    batteryUse: "#c0c9d2",
    fuelUse: "#e9e2c0",
    legend: "#777",
  };

  const defaultRender: Render = {
    dimensions: {
      fullHeight: 100,
      usableWidth: 50,
      usableHeight: 50,
    },
    max: 100,
    ice: {
      x: 0,
      y: 0,
      label: "ICE",
      total: 0,
      rects: [
        {
          key: "ice-man",
          color: colors.manufacturing,
          height: 10,
          width: 5,
          x: 10,
          y: 10,
        },
      ],
    },
    phev: {
      x: 0,
      y: 0,
      label: "PHEV",
      total: 0,
      rects: [
        {
          key: "phev-man",
          color: colors.manufacturing,
          height: 10,
          width: 5,
          x: 10,
          y: 10,
        },
      ],
    },
    bev: {
      x: 0,
      y: 0,
      label: "BEV",
      total: 0,
      rects: [
        {
          key: "bev-man",
          color: colors.manufacturing,
          height: 10,
          width: 5,
          x: 10,
          y: 10,
        },
      ],
    },
  };

  const [render, setRender] = useState<Render>(defaultRender);

  const [renewablesMix, setRenewablesMix] = useState(21);
  const [phevMix, setPhevMix] = useState(70);
  const [lifetimeMiles, setLifetimeMiles] = useState(175000);
  const [phevBatterySize, setPhevBatterySize] = useState(14);
  const [bevBatterySize, setBevBatterySize] = useState(79);

  const padding = 20;
  const legendPadding = 30;
  const eol = 0.5;
  const man = 1.4;
  const iceMaterials = 13;
  const bevMaterials = 17;
  const hybridFactor = 1.1;

  useEffect(() => {
    if (elementRef.current) {
      // @ts-ignore
      const boundingRect = elementRef.current.getBoundingClientRect();
      const dimensions: Dimensions = {
        fullHeight: boundingRect.width * 0.5,
        usableWidth: boundingRect?.width - 2 * padding - legendPadding,
        usableHeight: boundingRect?.height - 2 * padding - legendPadding,
      };

      const bevBattery = bevBatterySize * 0.0886075949367089;
      const phevBattery = phevBatterySize * 0.0886075949367089;
      const phevBatteryUse =
        (((1 - renewablesMix / 100) * 0.0002722191604 +
          (renewablesMix / 100) * 0.000003218688) *
          lifetimeMiles *
          phevMix) /
        100;

      const bevBatteryUse =
        ((1 - renewablesMix / 100) * 0.0002722191604 +
          (renewablesMix / 100) * 0.000003218688) *
        lifetimeMiles;
      const phevFuelUse =
        (0.00034600896 * (lifetimeMiles * (1 - phevMix / 100))) / hybridFactor;
      const iceFuelUse = 0.00034600896 * lifetimeMiles;
      const iceTotal = iceMaterials + man + eol + iceFuelUse;
      const phevTotal =
        bevMaterials + phevBattery + man + eol + phevBatteryUse + phevFuelUse;
      const bevTotal =
        bevMaterials + phevBattery + man + eol + phevBatteryUse + phevFuelUse;
      const max = Math.max(iceTotal, phevTotal, bevTotal);
      setRender({
        dimensions: dimensions,
        max: max,
        ice: {
          x: legendPadding + (dimensions.usableWidth * 1) / 9,
          y: 0,
          label: "ICE",
          total: iceTotal,
          rects: [
            {
              key: "ice-materials",
              color: colors.materials,
              height: (dimensions.usableHeight * iceMaterials) / max,
              width: dimensions.usableWidth / 9,
              x: 0,
              y: dimensions.usableHeight * (1 - iceMaterials / max),
            },
            {
              key: "ice-man",
              color: colors.manufacturing,
              height: (dimensions.usableHeight * man) / max,
              width: dimensions.usableWidth / 9,
              x: 0,
              y: dimensions.usableHeight * (1 - (iceMaterials + man) / max),
            },

            {
              key: "ice-use-fuel",
              color: colors.fuelUse,
              height: (dimensions.usableHeight * iceFuelUse) / max,
              width: dimensions.usableWidth / 9,
              x: 0,
              y:
                dimensions.usableHeight *
                (1 - (iceMaterials + man + iceFuelUse) / max),
            },
            {
              key: "ice-eol",
              color: colors.eol,
              height: (dimensions.usableHeight * eol) / max,
              width: dimensions.usableWidth / 9,
              x: 0,
              y:
                dimensions.usableHeight *
                (1 - (iceMaterials + man + iceFuelUse + eol) / max),
            },
          ],
        },
        phev: {
          x: legendPadding + (dimensions.usableWidth * 4) / 9,
          y: 0,
          label: "PHEV",
          total:
            bevMaterials +
            phevBattery +
            man +
            eol +
            phevBatteryUse +
            phevFuelUse,
          rects: [
            {
              key: "phev-materials",
              color: colors.materials,
              height: (dimensions.usableHeight * bevMaterials) / max,
              width: dimensions.usableWidth / 9,
              x: 0,
              y: dimensions.usableHeight * (1 - bevMaterials / max),
            },
            {
              key: "phev-batt",
              color: colors.battery,
              height: (dimensions.usableHeight * phevBattery) / max,
              width: dimensions.usableWidth / 9,
              x: 0,
              y:
                dimensions.usableHeight *
                (1 - (bevMaterials + phevBattery) / max),
            },
            {
              key: "phev-man",
              color: colors.manufacturing,
              height: (dimensions.usableHeight * man) / max,
              width: dimensions.usableWidth / 9,
              x: 0,
              y:
                dimensions.usableHeight *
                (1 - (bevMaterials + phevBattery + man) / max),
            },
            {
              key: "phev-use-batt",
              color: colors.batteryUse,
              height: (dimensions.usableHeight * phevBatteryUse) / max,
              width: dimensions.usableWidth / 9,
              x: 0,
              y:
                dimensions.usableHeight *
                (1 - (bevMaterials + phevBattery + man + phevBatteryUse) / max),
            },
            {
              key: "phev-use-fuel",
              color: colors.fuelUse,
              height: (dimensions.usableHeight * phevFuelUse) / max,
              width: dimensions.usableWidth / 9,
              x: 0,
              y:
                dimensions.usableHeight *
                (1 -
                  (bevMaterials +
                    phevBattery +
                    man +
                    phevBatteryUse +
                    phevFuelUse) /
                    max),
            },
            {
              key: "phev-eol",
              color: colors.eol,
              height: (dimensions.usableHeight * eol) / max,
              width: dimensions.usableWidth / 9,
              x: 0,
              y:
                dimensions.usableHeight *
                (1 -
                  (bevMaterials +
                    phevBattery +
                    man +
                    eol +
                    phevBatteryUse +
                    phevFuelUse) /
                    max),
            },
          ],
        },
        bev: {
          x: legendPadding + (dimensions.usableWidth * 7) / 9,
          y: 0,
          label: "BEV",
          total: bevMaterials + bevBattery + man + eol + bevBatteryUse,
          rects: [
            {
              key: "bev-materials",
              color: colors.materials,
              height: (dimensions.usableHeight * bevMaterials) / max,
              width: dimensions.usableWidth / 9,
              x: 0,
              y: dimensions.usableHeight * (1 - bevMaterials / max),
            },
            {
              key: "bev-batt",
              color: colors.battery,
              height: (dimensions.usableHeight * bevBattery) / max,
              width: dimensions.usableWidth / 9,
              x: 0,
              y:
                dimensions.usableHeight *
                (1 - (bevMaterials + bevBattery) / max),
            },
            {
              key: "bev-man",
              color: colors.manufacturing,
              height: (dimensions.usableHeight * man) / max,
              width: dimensions.usableWidth / 9,
              x: 0,
              y:
                dimensions.usableHeight *
                (1 - (bevMaterials + bevBattery + man) / max),
            },
            {
              key: "bev-use-batt",
              color: colors.batteryUse,
              height: (dimensions.usableHeight * bevBatteryUse) / max,
              width: dimensions.usableWidth / 9,
              x: 0,
              y:
                dimensions.usableHeight *
                (1 - (bevMaterials + bevBattery + man + bevBatteryUse) / max),
            },
            {
              key: "bev-eol",
              color: colors.eol,
              height: (dimensions.usableHeight * eol) / max,
              width: dimensions.usableWidth / 9,
              x: 0,
              y:
                dimensions.usableHeight *
                (1 -
                  (bevMaterials + bevBattery + man + eol + bevBatteryUse) /
                    max),
            },
          ],
        },
      });
    }
  }, [phevMix, renewablesMix, lifetimeMiles, bevBatterySize, phevBatterySize]);

  return (
    <main>
      <div className="container mx-auto p-2">
        <div className="text-3xl">Total vehicle carbon footprint</div>
        <div className="text-md">Imagining the Volvo XC-40 as a PHEV</div>
        <a
          href="https://www.volvocars.com/images/v/-/media/applications/pdpspecificationpage/xc40-electric/specification/volvo-carbon-footprint-report.pdf"
          className="text-md text-blue-500 underline"
        >
          Original study
        </a>
        <div className="flex flex-row flex-wrap justify-between">
          <div className="p-2">
            <label className="text-xl">
              Vehicle lifetime (miles)
              <br />
              <select
                name="lifetimeMiles"
                className="text-gray-500 shadow appearance-none border rounded w-full py-2 px-3"
                defaultValue="175000"
                onChange={(e) => {
                  setLifetimeMiles(parseInt(e.target.value));
                }}
              >
                <option value="50000">50,000</option>
                <option value="75000">75,000</option>
                <option value="100000">100,000</option>
                <option value="125000">125,000</option>
                <option value="150000">150,000</option>
                <option value="175000">175,000</option>
                <option value="200000">200,000</option>
                <option value="225000">225,000</option>
                <option value="250000">250,000</option>
                <option value="275000">275,000</option>
                <option value="300000">300,000</option>
              </select>
            </label>
            <p className="text-gray-500">
              Mileage at end-of-life for all vehicle types
            </p>
          </div>
          <div className="p-2">
            <label className="text-xl">
              BEV Battery Size (KwH):
              <br />
              <select
                name="bevBatterySize"
                className="text-gray-500 shadow appearance-none border rounded w-full py-2 px-3"
                defaultValue="79"
                onChange={(e) => {
                  setBevBatterySize(parseInt(e.target.value));
                }}
              >
                <option value="24">24 - Nissan Leaf 2010-2015</option>
                <option value="30">30 - Nissan Leaf 2016</option>
                <option value="40">40 - Nissan Leaf 2017</option>
                <option value="56">56 - Tesla Model Y</option>
                <option value="62">62 - Nissan Leaf 2017 Long range</option>
                <option value="65">65 - Chevy Bolt EV and EUV</option>
                <option value="75">75 - Tesla Model Y Long Range</option>
                <option value="79">79 - Volvo XC-40 Recharge</option>
                <option value="98">98 - F150 Ligtning</option>
                <option value="100">100 - Tesla Model X</option>
                <option value="131">131 - F150 Lightning Extended Range</option>
              </select>
            </label>
            <p className="text-gray-500">Size in KwH of the BEV battery</p>
          </div>
          <div className="p-2">
            <label className="text-xl">
              PHEV Battery Size (KwH):
              <br />
              <select
                name="phevBatterySize"
                className="text-gray-500 shadow appearance-none border rounded w-full py-2 px-3"
                defaultValue="13.8"
                onChange={(e) => {
                  setPhevBatterySize(parseFloat(e.target.value));
                }}
              >
                <option value="8.8">8.8 - Prius Prime</option>
                <option value="13.8">13.8 - Kia PHEV models</option>
                <option value="16">16 - Chevy Volt</option>
                <option value="18.1">18.1 - RAV4 Prime</option>
              </select>
            </label>
            <p className="text-gray-500">Size in KwH of the PHEV battery</p>
          </div>
          <div className="p-2">
            <label className="text-xl">
              Share of electricity from renewable sources:
              <br />
              <select
                name="renewables"
                className="text-gray-500 shadow appearance-none border rounded w-full py-2 px-3"
                defaultValue="21"
                onChange={(e) => {
                  setRenewablesMix(parseInt(e.target.value));
                }}
              >
                <option value="3">3% - MS</option>
                <option value="10">10%</option>
                <option value="18">18% - Global Avg</option>
                <option value="20">20%</option>
                <option value="21">21% - US Avg</option>
                <option value="30">30%</option>
                <option value="40">40%</option>
                <option value="43">43% - CA</option>
                <option value="50">50%</option>
                <option value="60">60%</option>
                <option value="70">70%</option>
                <option value="80">80%</option>
                <option value="90">90%</option>
                <option value="100">100%</option>
              </select>
            </label>
            <p className="text-gray-500 text-sm">
              The percentage of renewable electricity used to charge the PHEV
              and BEV.
            </p>
            <p className="text-gray-500 text-sm">
              Varies by state and presence of a home renewable installation
              (e.g. rooftop solar).
            </p>
          </div>
          <div className="p-2">
            <label className="text-xl">
              PHEV % EV miles:
              <br />
              <select
                name="phevMix"
                className="text-gray-500 shadow appearance-none border rounded w-full py-2 px-3"
                defaultValue="70"
                onChange={(e) => {
                  setPhevMix(parseInt(e.target.value));
                }}
              >
                <option value="0">0%</option>
                <option value="10">10%</option>
                <option value="20">20%</option>
                <option value="30">30%</option>
                <option value="40">40%</option>
                <option value="50">50%</option>
                <option value="60">60%</option>
                <option value="70">70%</option>
                <option value="80">80%</option>
                <option value="90">90%</option>
                <option value="100">100%</option>
              </select>
            </label>
            <p className="text-gray-500">
              Percent of all miles that are driven in pure EV for PHEV
            </p>
          </div>
        </div>
        <svg ref={elementRef} width="100%" height="400px">
          <g transform={`translate(${padding},${padding})`}>
            <line
              x1={legendPadding}
              y1={0}
              x2={legendPadding}
              y2={render.dimensions.usableHeight}
              stroke={colors.legend}
            />
            <line
              x1={legendPadding}
              y1={render.dimensions.usableHeight}
              x2={render.dimensions.usableWidth}
              y2={render.dimensions.usableHeight}
              stroke={colors.legend}
            />
            <g transform={`translate(${render.ice.x}, ${render.ice.y})`}>
              <text
                textAnchor="middle"
                fill={colors.legend}
                x={render.ice.rects[0].width / 2}
                y={render.dimensions.usableHeight + legendPadding}
              >
                {render.ice.label}
              </text>
              <text
                textAnchor="middle"
                fill={colors.legend}
                x={render.phev.rects[0].width / 2}
                y={
                  render.dimensions.usableHeight *
                    (1 - render.ice.total / render.max) -
                  3
                }
              >
                {render.ice.total.toFixed(1)}
              </text>
              {render.ice.rects.map((r) => (
                <rect
                  transform={`translate(${r.x}, ${r.y})`}
                  key={r.key}
                  fill={r.color}
                  height={r.height}
                  width={r.width}
                />
              ))}
            </g>
            <g transform={`translate(${render.phev.x}, ${render.phev.y})`}>
              <text
                textAnchor="middle"
                fill={colors.legend}
                x={render.phev.rects[0].width / 2}
                y={render.dimensions.usableHeight + legendPadding}
              >
                {render.phev.label}
              </text>
              <text
                textAnchor="middle"
                fill={colors.legend}
                x={render.phev.rects[0].width / 2}
                y={
                  render.dimensions.usableHeight *
                    (1 - render.phev.total / render.max) -
                  3
                }
              >
                {render.phev.total.toFixed(1)}
              </text>
              {render.phev.rects.map((r) => (
                <rect
                  transform={`translate(${r.x}, ${r.y})`}
                  key={r.key}
                  fill={r.color}
                  height={r.height}
                  width={r.width}
                />
              ))}
            </g>
            <g transform={`translate(${render.bev.x}, ${render.bev.y})`}>
              <text
                textAnchor="middle"
                fill={colors.legend}
                x={render.bev.rects[0].width / 2}
                y={render.dimensions.usableHeight + legendPadding}
              >
                {render.bev.label}
              </text>
              <text
                textAnchor="middle"
                fill={colors.legend}
                x={render.bev.rects[0].width / 2}
                y={
                  render.dimensions.usableHeight *
                    (1 - render.bev.total / render.max) -
                  3
                }
              >
                {render.bev.total.toFixed(1)}
              </text>
              {render.bev.rects.map((r) => (
                <rect
                  transform={`translate(${r.x}, ${r.y})`}
                  key={r.key}
                  fill={r.color}
                  height={r.height}
                  width={r.width}
                />
              ))}
            </g>
          </g>
        </svg>
      </div>
    </main>
  );
}
