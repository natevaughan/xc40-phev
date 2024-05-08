import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

const KEY_RENEWABLES_MIX = "rx";
const KEY_PHEV_MIX = "ex";
const KEY_VEHICLE_LIFETIME = "lt";
const KEY_PHEV_BATT_SIZE = "pb";
const KEY_EV_BATT_SIZE = "eb";
const KEY_HYBRID_EFFICIENCY = "he";

interface Dimensions {
  fullHeight: number;
  usableWidth: number;
  usableHeight: number;
}

interface Render {
  dimensions: Dimensions;
  max: number;
  ticks: number[];
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
  ticks: [],
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

export default function Home() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const setSearchParam = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set(name, value);

      router.push(pathname + "?" + params.toString(), { scroll: false });
    },
    [searchParams, pathname, router],
  );

  const elementRef = useRef(null);

  const [render, setRender] = useState<Render>(defaultRender);

  const renewablesMix: number = Number.parseInt(
    searchParams.get(KEY_RENEWABLES_MIX) ?? "43",
  );
  const phevMix: number = Number.parseInt(
    searchParams.get(KEY_PHEV_MIX) ?? "60",
  );
  const lifetimeMiles: number = Number.parseInt(
    searchParams.get(KEY_VEHICLE_LIFETIME) ?? "125000",
  );
  const phevBatterySize: number = Number.parseFloat(
    searchParams.get(KEY_PHEV_BATT_SIZE) ?? "10.7",
  );
  const bevBatterySize: number = Number.parseFloat(
    searchParams.get(KEY_EV_BATT_SIZE) ?? "79",
  );
  const hybridEfficencyGain: number = Number.parseInt(
    searchParams.get(KEY_HYBRID_EFFICIENCY) ?? "25",
  );

  const padding = 20;
  const legendPadding = 30;
  const tickLength = 10;
  const eol = 0.5;
  const man = 1.4;
  const iceMaterials = 14;
  const phevMaterials = 16;
  const bevMaterials = 17;

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
      const hybridFactor = 1 + hybridEfficencyGain / 100;
      const phevFuelUse =
        (0.00034600896 * (lifetimeMiles * (1 - phevMix / 100))) / hybridFactor;
      const iceFuelUse = 0.00034600896 * lifetimeMiles;
      const iceTotal = iceMaterials + man + eol + iceFuelUse;
      const phevTotal =
        phevMaterials + phevBattery + man + eol + phevBatteryUse + phevFuelUse;
      const bevTotal =
        bevMaterials + phevBattery + man + eol + phevBatteryUse + phevFuelUse;
      const max = Math.max(iceTotal, phevTotal, bevTotal) + 6;
      const ticks = [
        0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120, 130,
      ].filter((it) => it < max);
      setRender({
        dimensions: dimensions,
        max: max,
        ticks: ticks,
        ice: {
          x: legendPadding + (dimensions.usableWidth * 1) / 15,
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
              y: dimensions.usableHeight * (1 - (iceMaterials + man) / max) - 1,
            },

            {
              key: "ice-use-fuel",
              color: colors.fuelUse,
              height: (dimensions.usableHeight * iceFuelUse) / max,
              width: dimensions.usableWidth / 9,
              x: 0,
              y:
                dimensions.usableHeight *
                  (1 - (iceMaterials + man + iceFuelUse) / max) -
                2,
            },
            {
              key: "ice-eol",
              color: colors.eol,
              height: (dimensions.usableHeight * eol) / max,
              width: dimensions.usableWidth / 9,
              x: 0,
              y:
                dimensions.usableHeight *
                  (1 - (iceMaterials + man + iceFuelUse + eol) / max) -
                3,
            },
          ],
        },
        phev: {
          x: legendPadding + (dimensions.usableWidth * 4) / 15,
          y: 0,
          label: "PHEV",
          total:
            phevMaterials +
            phevBattery +
            man +
            eol +
            phevBatteryUse +
            phevFuelUse,
          rects: [
            {
              key: "phev-materials",
              color: colors.materials,
              height: (dimensions.usableHeight * phevMaterials) / max,
              width: dimensions.usableWidth / 9,
              x: 0,
              y: dimensions.usableHeight * (1 - phevMaterials / max),
            },
            {
              key: "phev-batt",
              color: colors.battery,
              height: (dimensions.usableHeight * phevBattery) / max,
              width: dimensions.usableWidth / 9,
              x: 0,
              y:
                dimensions.usableHeight *
                  (1 - (phevMaterials + phevBattery) / max) -
                1,
            },
            {
              key: "phev-man",
              color: colors.manufacturing,
              height: (dimensions.usableHeight * man) / max,
              width: dimensions.usableWidth / 9,
              x: 0,
              y:
                dimensions.usableHeight *
                  (1 - (phevMaterials + phevBattery + man) / max) -
                2,
            },
            {
              key: "phev-use-batt",
              color: colors.batteryUse,
              height: (dimensions.usableHeight * phevBatteryUse) / max,
              width: dimensions.usableWidth / 9,
              x: 0,
              y:
                dimensions.usableHeight *
                  (1 -
                    (phevMaterials + phevBattery + man + phevBatteryUse) /
                      max) -
                3,
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
                    (phevMaterials +
                      phevBattery +
                      man +
                      phevBatteryUse +
                      phevFuelUse) /
                      max) -
                4,
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
                    (phevMaterials +
                      phevBattery +
                      man +
                      eol +
                      phevBatteryUse +
                      phevFuelUse) /
                      max) -
                5,
            },
          ],
        },
        bev: {
          x: legendPadding + (dimensions.usableWidth * 7) / 15,
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
                  (1 - (bevMaterials + bevBattery) / max) -
                1,
            },
            {
              key: "bev-man",
              color: colors.manufacturing,
              height: (dimensions.usableHeight * man) / max,
              width: dimensions.usableWidth / 9,
              x: 0,
              y:
                dimensions.usableHeight *
                  (1 - (bevMaterials + bevBattery + man) / max) -
                2,
            },
            {
              key: "bev-use-batt",
              color: colors.batteryUse,
              height: (dimensions.usableHeight * bevBatteryUse) / max,
              width: dimensions.usableWidth / 9,
              x: 0,
              y:
                dimensions.usableHeight *
                  (1 -
                    (bevMaterials + bevBattery + man + bevBatteryUse) / max) -
                3,
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
                      max) -
                4,
            },
          ],
        },
      });
    }
  }, [
    phevMix,
    renewablesMix,
    lifetimeMiles,
    bevBatterySize,
    phevBatterySize,
    hybridEfficencyGain,
  ]);

  return (
    <main>
      <div className="container mx-auto">
        <div>
          <img src="2023-Volvo-XC40-Recharge.jpg" alt="Volvo XC-40 Recharge" />
        </div>
        <div className="text-4xl text-center w-full my-3">
          The Volvo Total Lifecycle Carbon Study and the Missing XC-40 PHEV
        </div>
        <div className="text-md py-1">
          Volvo&apos;s{" "}
          <a
            href="https://www.volvocars.com/images/v/-/media/applications/pdpspecificationpage/xc40-electric/specification/volvo-carbon-footprint-report.pdf"
            className="text-md text-blue-500 underline"
          >
            excellent study
          </a>{" "}
          on total vehicle lifecycle carbon footprint brought to my attention
          the fact that XC-40 Rehcharge (BEV) starts its lifecycle with a 70%
          larger carbon footprint than its ICE equivalent XC-40 and slowly
          recuperates that carbon disadvantage over time at a rate dependent on
          the renewables mix of the electricity used to charge it.
        </div>
        <div className="text-md py-1">
          The higher manufacturing carbon footprint of the XC-40 Recharge is
          primarily due to greater use of aluminum (30% added carbon footprint)
          and the battery (40% added carbon footprint) vs the equivalent ICE.
        </div>
        <div className="text-md py-1">
          In all cases studied, the XC-40 recharge has a lower total lifecycle
          carbon footprint, but the difference is determined by the renewables
          mix of the electricity used to charge it and the total lifecycle
          miles.
        </div>
        <div className="text-2xl w-full my-3">
          Adding the XC-40 Plug-in Hybrid
        </div>
        <div className="text-md py-1">
          Notably absent from the Volvo study is the Plug-in Hybrid (PHEV)
          version of the XC-40. The PHEV is interesting because it has a small
          battery compared with the BEVs, which means it starts at a smaller
          disadvantage for the carbon associated with battery manufacturing.
          Under the right conditions, could the XC-40 Plug-in Hybrid have a
          lower total lifecycle carbon footprint than the BEV XC-40 Recharge?
        </div>
        <div className="text-md py-1">
          The following calculator parameterizes the inputs from the Volvo study
          and allows you to see which vehicle has the lowest total carbon input
          under what conditions.
        </div>

        <div className="text-md py-1">Hope you enjoy!</div>
        <div className="grid md:grid-cols-3 gap-x-8 gap-y-2 py-2">
          <div>
            <div>
              <label className="text-xl">
                Vehicle lifetime (miles)
                <br />
                <select
                  name="lifetimeMiles"
                  className="text-gray-600 shadow appearance-none border rounded w-full py-2 px-3"
                  value={lifetimeMiles.toString()}
                  onChange={(e) => {
                    setSearchParam(KEY_VEHICLE_LIFETIME, e.target.value);
                  }}
                >
                  <option value="300000">300,000</option>
                  <option value="275000">275,000</option>
                  <option value="250000">250,000</option>
                  <option value="225000">225,000</option>
                  <option value="200000">200,000</option>
                  <option value="175000">175,000</option>
                  <option value="150000">150,000</option>
                  <option value="125000">125,000</option>
                  <option value="100000">100,000</option>
                  <option value="75000">75,000</option>
                  <option value="50000">50,000</option>
                </select>
              </label>
              <p className="text-gray-600">
                Mileage at end-of-life for all vehicle types
              </p>
            </div>
            <div>
              <label className="text-xl">
                Share of electricity from renewable sources:
                <br />
                <select
                  name="renewables"
                  className="text-gray-600 shadow appearance-none border rounded w-full py-2 px-3"
                  value={renewablesMix.toString()}
                  onChange={(e) => {
                    setSearchParam(KEY_RENEWABLES_MIX, e.target.value);
                  }}
                >
                  <option value="100">100% - VT</option>
                  <option value="90">90%</option>
                  <option value="80">80%</option>
                  <option value="76">76% - WA</option>
                  <option value="70">70%</option>
                  <option value="60">60%</option>
                  <option value="50">50%</option>
                  <option value="43">43% - CA</option>
                  <option value="40">40%</option>
                  <option value="30">30%</option>
                  <option value="28">28% - NY</option>
                  <option value="26">26% - TX</option>
                  <option value="21">21% - US Avg</option>
                  <option value="20">20%</option>
                  <option value="18">18% - Global Avg</option>
                  <option value="10">10% - RI</option>
                  <option value="3">3% - MS</option>
                </select>
              </label>
              <p className="text-gray-600 text-sm">
                The percentage of renewable electricity used to charge the PHEV
                and BEV.
              </p>
              <p className="text-gray-600 text-sm">
                Varies by state and presence of a home renewable installation
                (e.g. rooftop solar).
              </p>
            </div>
            <div>
              <label className="text-xl">
                BEV Battery Size (KwH):
                <br />
                <select
                  name="bevBatterySize"
                  className="text-gray-600 shadow appearance-none border rounded w-full py-2 px-3"
                  value={bevBatterySize.toString()}
                  onChange={(e) => {
                    setSearchParam(KEY_EV_BATT_SIZE, e.target.value);
                  }}
                >
                  <option value="131">
                    131 - F150 Lightning Extended Range
                  </option>
                  <option value="100">100 - Tesla Model X, Kia EV9</option>
                  <option value="98">98 - F150 Ligtning</option>
                  <option value="79">79 - Volvo XC-40 Recharge</option>
                  <option value="75">75 - Tesla Model Y Long Range</option>
                  <option value="65">65 - Chevy Bolt EV and EUV</option>
                  <option value="62">62 - Nissan Leaf 2017 Long range</option>
                  <option value="56">56 - Tesla Model Y</option>
                  <option value="40">40 - Nissan Leaf 2017</option>
                  <option value="30">30 - Nissan Leaf 2016</option>
                  <option value="24">24 - Nissan Leaf 2010-2015</option>
                </select>
              </label>
              <p className="text-gray-600">Size in KwH of the BEV battery</p>
            </div>
            <div>
              <label className="text-xl">
                PHEV Battery Size (KwH):
                <br />
                <select
                  name="phevBatterySize"
                  className="text-gray-600 shadow appearance-none border rounded w-full py-2 px-3"
                  value={phevBatterySize.toString()}
                  onChange={(e) => {
                    setSearchParam(KEY_PHEV_BATT_SIZE, e.target.value);
                  }}
                >
                  <option value="20">20 - Mitsubishi Outlander</option>
                  <option value="18.1">18.1 - RAV4 Prime</option>
                  <option value="16">16 - Chevy Volt</option>
                  <option value="13.8">13.8 - Kia PHEV models</option>
                  <option value="10.7">10.7 - XC-40 PHEV</option>
                  <option value="8.8">8.8 - Prius Prime</option>
                </select>
              </label>
              <p className="text-gray-600">Size in KwH of the PHEV battery</p>
            </div>

            <div>
              <label className="text-xl">
                PHEV % EV miles:
                <br />
                <select
                  name="phevMix"
                  className="text-gray-600 shadow appearance-none border rounded w-full py-2 px-3"
                  value={phevMix.toString()}
                  onChange={(e) => {
                    setSearchParam(KEY_PHEV_MIX, e.target.value);
                  }}
                >
                  <option value="100">100%</option>
                  <option value="95">95%</option>
                  <option value="90">90%</option>
                  <option value="85">85%</option>
                  <option value="80">80%</option>
                  <option value="75">75%</option>
                  <option value="70">70%</option>
                  <option value="65">65%</option>
                  <option value="60">60%</option>
                  <option value="55">55%</option>
                  <option value="50">50%</option>
                  <option value="45">45%</option>
                  <option value="40">40%</option>
                  <option value="35">35%</option>
                  <option value="30">30%</option>
                  <option value="25">25%</option>
                  <option value="20">20%</option>
                  <option value="15">15%</option>
                  <option value="10">10%</option>
                  <option value="5">5%</option>
                  <option value="0">0%</option>
                </select>
              </label>
              <p className="text-gray-600">
                Percent of all miles that are driven in pure EV for PHEV
              </p>
            </div>

            <div>
              <label className="text-xl">
                PHEV Hybrid MPG increase:
                <br />
                <select
                  name="phevEfficiencyGain"
                  className="text-gray-600 shadow appearance-none border rounded w-full py-2 px-3"
                  value={hybridEfficencyGain}
                  onChange={(e) => {
                    setSearchParam(KEY_HYBRID_EFFICIENCY, e.target.value);
                  }}
                >
                  <option value="60">60%</option>
                  <option value="55">55%</option>
                  <option value="50">50%</option>
                  <option value="45">45%</option>
                  <option value="41">41% - Average (City)</option>
                  <option value="40">40%</option>
                  <option value="35">35%</option>
                  <option value="30">30%</option>
                  <option value="28">28%</option>
                  <option value="25">25% - Average (Combined)</option>
                  <option value="20">20%</option>
                  <option value="15">15%</option>
                  <option value="12">12% - Average (Highway)</option>
                  <option value="10">10%</option>
                  <option value="5">5%</option>
                  <option value="0">0%</option>
                </select>
              </label>
              <p className="text-gray-600">
                Percent gain in miles traveled per gallon of fuel used for PHEV
                over ICE when using fuel. Averages are sourced from EPA
                estimates of fuel economy for vehicles available in both ICE and
                PHEV models.
              </p>
            </div>
          </div>
          <div className="md:col-span-2">
            <p className="text-gray-600 w-full text-center">
              Total Lifecycle Metric Tons CO2
            </p>
            <svg
              ref={elementRef}
              width="100%"
              height="100%"
              className="min-h-96"
            >
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
                  x2={(render.dimensions.usableWidth * 10) / 15}
                  y2={render.dimensions.usableHeight}
                  stroke={colors.legend}
                />
                {render.ticks.map((it) => (
                  <g
                    key={`tick-${it}`}
                    transform={`translate(${legendPadding - tickLength}, ${render.dimensions.usableHeight * (1 - it / render.max)})`}
                  >
                    <line
                      x1={0}
                      y1={0}
                      x2={tickLength}
                      y2={0}
                      stroke={colors.legend}
                    />
                    <text
                      x="-2"
                      y="0.375em"
                      fontSize="0.75em"
                      textAnchor="end"
                      fill={colors.legend}
                    >
                      {it}
                    </text>
                  </g>
                ))}
                <g
                  transform={`translate(${(render.dimensions.usableWidth * 11) / 15},${padding})`}
                >
                  <g transform={`translate(0,0)`}>
                    <rect height={15} width={15} fill={colors.eol} />
                    <text x="22" y="13" textAnchor="start">
                      End of Life
                    </text>
                  </g>
                  <g transform={`translate(0,25)`}>
                    <rect height={15} width={15} fill={colors.fuelUse} />
                    <text x="22" y="13" textAnchor="start">
                      Use phase - Fuel
                    </text>
                  </g>
                  <g transform={`translate(0,50)`}>
                    <rect height={15} width={15} fill={colors.batteryUse} />
                    <text x="22" y="13" textAnchor="start">
                      Use phase - Electricity
                    </text>
                  </g>
                  <g transform={`translate(0,75)`}>
                    <rect height={15} width={15} fill={colors.manufacturing} />
                    <text x="22" y="13" textAnchor="start">
                      Vehicle manufacturing
                    </text>
                  </g>
                  <g transform={`translate(0,100)`}>
                    <rect height={15} width={15} fill={colors.battery} />
                    <text x="22" y="13" textAnchor="start">
                      Battery
                    </text>
                  </g>
                  <g transform={`translate(0,125)`}>
                    <rect height={15} width={15} fill={colors.materials} />
                    <text x="22" y="13" textAnchor="start">
                      Materials
                    </text>
                  </g>
                </g>
                <g transform={`translate(${render.ice.x}, ${render.ice.y})`}>
                  <text
                    fontSize="1em"
                    textAnchor="middle"
                    fill={colors.legend}
                    x={render.ice.rects[0].width / 2}
                    y={render.dimensions.usableHeight + legendPadding / 2 + 2}
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
                      6
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
                    fontSize="1em"
                    textAnchor="middle"
                    fill={colors.legend}
                    x={render.phev.rects[0].width / 2}
                    y={render.dimensions.usableHeight + legendPadding / 2 + 2}
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
                      8
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
                    fontSize="1em"
                    textAnchor="middle"
                    fill={colors.legend}
                    x={render.bev.rects[0].width / 2}
                    y={render.dimensions.usableHeight + legendPadding / 2 + 2}
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
                      8
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
        </div>
        <div className="text-2xl w-full my-3">Assumptions and Caveats</div>
        <div className="text-md py-1">
          One key assumption is that a PHEV has a materials carbon footprint
          less than or equal to a BEV. The authors of the Volvo study cite the
          extensive use of aluminum in BEV batteries and powertrains as being a
          major source of added carbon footprint.
        </div>
        <div className="text-md py-1">
          Curb weight is a reasonable proxy for the carbon footprint associated
          with materials. Looking at vehicles available from major manufacturers
          in both ICE and PHEV configurations or ICE and BEV configurations, on
          average a PHEV weighs 14% more than its ICE equivalent, and a BEV
          weighs 21% more than its ICE equivalent. Thus it is reasonable to
          assume that a PHEV is no worse (and may be up to 5% better) than a BEV
          from a materials standpoint.
        </div>
        <div className="text-md py-1">
          What about added manufacturing complexity and engineering complexity
          of the dual powertrains used in PHEVs? The Volvo study suggests that
          such complexity may be negligble. Both ICE and BEV versions of the
          XC-40 have 1.4 metric tons of carbon associated with Volvo
          manufacturing—the second smallest category of carbon footprint (behind
          EOL carbon). It is difficult to imagine that the PHEV XC-40 has a
          meaningfully different carbon footprint associated with manufacturing.
        </div>
      </div>
    </main>
  );
}
