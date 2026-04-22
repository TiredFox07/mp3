window.navigation.addEventListener("navigate", (event) => {
	setTimeout(setupChart, 500);
});

const setupChart = () => {
	const series = {
		"All developers": [
			{ year: 2017, percent: 4.3 },
			{ year: 2018, percent: 7.1 },
			{ year: 2019, percent: 8.2 },
			{ year: 2020, percent: 8.8 },
			{ year: 2021, percent: 9.55 },
			{ year: 2022, percent: 11.15 },
			{ year: 2023, percent: 13.24 },
			{ year: 2024, percent: 13.5 },
			{ year: 2025, percent: 16.4 }
		],
		"Professional developers": [
			{ year: 2017, percent: 4.6 },
			{ year: 2018, percent: 7.2 },
			{ year: 2019, percent: 8.8 },
			{ year: 2020, percent: 9.4 },
			{ year: 2021, percent: 10.51 },
			{ year: 2022, percent: 11.83 },
			{ year: 2023, percent: 14.32 },
			{ year: 2024, percent: 14.4 },
			{ year: 2025, percent: 17.4 }
		]
	};

	const canvas = document.getElementById("graph");

	if (!canvas) {
		console.log("No canvas#graph found");
		return;
	}

	const ctx = canvas.getContext("2d");
	let DPR = window.devicePixelRatio || 1;

	const resizeCanvas = () => {
		DPR = window.devicePixelRatio || 1;
		const w = canvas.parentElement.clientWidth;
		const h = 340;
		canvas.width = w * DPR;
		canvas.height = h * DPR;
		canvas.style.width = w + "px";
		canvas.style.height = h + "px";
		ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
		draw();
	};

	window.addEventListener("resize", resizeCanvas);

	const padding = { top: 24, right: 28, bottom: 52, left: 58 };

	const graphDims = () => {
		const W = canvas.width / DPR;
		const H = canvas.height / DPR;
		return { W, H, cW: W - padding.left - padding.right, cH: H - padding.top - padding.bottom };
	};

	const allPoints = () => {
		return Object.values(series).flat();
	};

	const dataRange = () => {
		const pts = allPoints();
		if (!pts.length) return { minX: 2018, maxX: 2024, minY: 0, maxY: 100 };
		const years = pts.map(p => p.year);
		const percents = pts.map(p => p.percents);
		let minY = Math.min(...percents), maxY = Math.max(...percents);
		const pad = Math.max((maxY - minY) * 0.18, 5);
		return {
			minX: Math.min(...years) - 0.3,
			maxX: Math.max(...years) + 0.3,
			minY: minY - pad,
			maxY: maxY + pad
		};
	};

	const toCanvas = (x, y, range, dims) => {
		const px = padding.left + (x - range.minX) / (range.maxX - range.minX) * dims.cW;
		const py = padding.top + (1 - (y - range.minY) / (range.maxY - range.minY)) * dims.cH;
		return { px, py };
	};

	const niceYTicks = (min, max, count) => {
		const range = max - min;
		const raw = range / (count - 1);
		const mag = Math.pow(10, Math.floor(Math.log10(raw)));
		const nice = [1, 2, 2.5, 5, 10].map(f => f*mag).find(f => f >= raw) || raw;
		const start = Math.ceil(min / nice) * nice;
		const ticks = [];
		for (let v = start; v <= max + 1e-9; v += nice) ticks.push(+v.toFixed(10));
		return ticks;
	};

	const draw = () => {
		const { W, H, cW, cH } = graphDims();
		ctx.clearRect(0, 0, W, H);

		const range = dataRange();

		// Background
		ctx.fillStyle = "#f1f9f7";
		ctx.fillRect(0, 0, W, H);

		// Grid
		const yTicks = niceYTicks(range.minY, range.maxY, 6);
		ctx.save();
		ctx.strokeStyle = "#000000";
		ctx.lineWidth = 1;
		ctx.setLineDash([4, 4]);
		ctx.font = "DM Mono, monospace";
		ctx.fillStyle = "#5a5c70";
		ctx.textAlign = "right";

		yTicks.forEach(v => {
			const { py } = toCanvas(range.minX, v, range, { cW, cH});
			ctx.beginPath();
			ctx.moveTo(padding.left, padding.top + (1 - (v - range.minY) / (range.maxY - range.minY)) * cH);
			ctx.lineTo(padding.left + cW, padding.top + (1 - (v - range.minY) / (range.maxY - range.minY)) * cH);
			ctx.stroke();
			ctx.fillText(v.toFixed(1) + '%', padding.left - 8, padding.top + (1 - (v - range.minY) / (range.maxY - range.minY)) * cH + 4);
		});
		ctx.restore();

		// X axis ticks
		const allYears = allPoints().map(p => p.year);
		const uniqueYears = allYears.length ? [...new Set(allYears)].sort((a, b) => a-b) : niceYTicks(range.minX + 0.3, range.maxX - 0.3, 5).map(Math.round);

		ctx.save();
		ctx.fillStyle = "#000";
		ctx.font = "11px DM Mono, monospace";
		ctx.textAlign = "center";
		uniqueYears.forEach(yr => {
			const { px } = toCanvas(yr, 0, range, { cW, cH });
			ctx.fillText(yr, px, padding.top + cH + 22);
			ctx.save();
			ctx.strokeStyle = "#123456";
			ctx.lineWidth = 1;
			ctx.setLineDash([4, 4]);
			ctx.beginPath();
			ctx.moveTo(px, padding.top);
			ctx.lineTo(px, padding.top + cH);
			ctx.stroke();
			ctx.restore();
		});
		ctx.restore();

		// Zero line
		if (range.minY < 0 && range.maxY > 0) {
			const { py } = toCanvas(range.minX, 0, range, { cW, cH });
			ctx.save()
			ctx.strokeStyle = "#444";
			ctx.lineWidth = 1.5;
			ctx.setLineDash([]);
			ctx.beginPath();
			ctx.moveTo(padding.left, py);
			ctx.lineTo(padding.left + cW, py);
			ctx.stroke();
			ctx.restore();
		}

		// Axes border
		ctx.save();
		ctx.strokeStyle = "#000";
		ctx.lineWidth = 1;
		ctx.strokeRect(padding.left, padding.top, cW, cH);
		ctx.restore();

		// Series lines + points
		const names = Object.keys(series);
		names.forEach((name, si) => {
			const pts = [...series[name]].sort((a, b) => a.year - b.year);
			if (!pts.length) return;
			const color = "#0f0";

			// gradient to fill under line
			const gradient = ctx.createLinearGradient(0, padding.top, 0, padding.top + cH);
			gradient.addColorStop(0, color + '28');
			gradient.addColorStop(1, color + '00');
			ctx.save();
			ctx.beginPath();
			pts.forEach((p, i) => {
				const { px, py } = toCanvas(p.year, p.percent, range, { cW, cH });
				i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
			});
			const lastPt = toCanvas(pts[pts.length - 1].year, pts[pts.length-1].percent, range, { cW, cH });
			const firstPt = toCanvas(pts[0].year, pts[0].percent, range, { cW, cH });
			ctx.lineTo(lastPt.px, padding.top + cH);
			ctx.lineTo(firstPt.px, padding.top + cH);
			ctx.closePath();
			ctx.fillStyle = gradient;
			ctx.fill();
			ctx.restore();

			// line
			ctx.save();
			ctx.strokeStyle = color;
			ctx.lineWidth = 2.5;
			ctx.lineJoin = 'round';
			ctx.setLineDash([]);
			ctx.beginPath();
			pts.forEach((p, i) => {
				const { px, py } = toCanvas(p.year, p.percent, range, { cW, cH });
				i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
			});
			ctx.stroke();
			ctx.restore();

			// dots
			pts.forEach((p) => {
				const { px, py } = toCanvas(p.year, p.percent, range, { cW, cH });

				ctx.save();
				ctx.beginPath();
				ctx.arc(px, py, 5, 0, Math.PI * 2);
				ctx.fillStyle = "#444";
				ctx.fill();
				ctx.strokeStyle = color;
				ctx.lineWidth = 2;
				ctx.stroke();
				ctx.restore();
			});
		});

		// Y axis label
		ctx.save();
		ctx.translate(14, padding.top + cH / 2);
		ctx.rotate(-Math.PI / 2);
		ctx.fillStyle = "#000";
		ctx.font = "11px DM Mono, monospace";
		ctx.textAlign = "center";
		ctx.fillText("PERCENT (%)", 0, 0);
		ctx.restore();

		// X axis label
		ctx.save();
		ctx.fillStyle = "#000";
		ctx.font = "11px DM Mono, monospace";
		ctx.textAlign = "center";
		ctx.fillText("YEAR", padding.left + cW / 2, H - 8);
		ctx.restore();
	};

	resizeCanvas();
};
