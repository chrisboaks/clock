const canvasEl = document.getElementById('canvas');
const ctx = canvasEl.getContext('2d');

const BLACK = '#111';
const WHITE = '#eee';
const RED = '#e11';
const SILVER = '#c0c0c0';


////////// CIRCLES

const CLOCK_FACE = {
  size: 0.98,
  thickness: 3,
  offset: 0,
  lineColor: BLACK,
  fillColor: WHITE,
};

const SECOND_INDICATOR = {
  size: 0.05,
  thickness: 0,
  offset: 0.69,
  lineColor: RED,
  fillColor: RED
};

const SECOND_HAND_BASE = {
  size: 0.02,
  thickness: 0,
  offset: 0,
  lineColor: RED,
  fillColor: RED
};

const CENTRAL_SCREW = {
  size: 0.006,
  thickness: 0,
  offset: 0,
  lineColor: SILVER,
  fillColor: SILVER
};


////////// SEGMENTS

const LARGE_TICK = {
  start: 0.76,
  end: 0.92,
  thickness: 10,
  color: BLACK
};

const SMALL_TICK = {
  start: 0.88,
  end: 0.92,
  thickness: 3,
  color: BLACK
};

const HOUR_HAND = {
  start: -0.1,
  end: 0.70,
  thickness: 15,
  color: BLACK
};

const MINUTE_HAND = {
  start: -0.1,
  end: 0.89,
  thickness: 12,
  color: BLACK
};

const SECOND_HAND = {
  start: -0.13,
  end: 0.7,
  thickness: 3,
  color: RED
};

let baseWindowSize, baseRadius, origin, basePixelSize;

const utils = {
  setCanvasSize() {
    windowSize = Math.min(window.innerWidth, window.innerHeight);
    baseRadius = origin = (windowSize / 2 - 10);
    basePixelSize = windowSize / 500;
    canvasEl.height = canvasEl.width = windowSize;
  },

  throttle(fn, waitTime) {
    if (typeof fn !== 'function' || typeof waitTime !== 'number') {
      throw new Error('must pass a function and a wait time');
    }

    let inCooldown = false;
    return function rv(...args) {
      if (!inCooldown) {
        inCooldown = true;
        setTimeout(() => inCooldown = false, waitTime);
        return fn.apply(null, args);
      } else {
        return null;
      }
    };
  },

  getRadialPoint(minute, distRatio) {
    const angle = 2 * Math.PI * (minute - 15) / 60;
    const radius = distRatio * baseRadius;

    const dx = Math.cos(angle) * radius;
    const dy = Math.sin(angle) * radius;

    return {
      x: origin + dx,
      y: origin + dy
    };
  },

  drawRadialSegment(minute, options) {
    const start = this.getRadialPoint(minute, options.start);
    const end = this.getRadialPoint(minute, options.end);

    ctx.lineWidth = options.thickness * basePixelSize;
    ctx.strokeStyle = options.color;
    ctx.beginPath();
    ctx.moveTo(start.x, start.y);
    ctx.lineTo(end.x, end.y);
    ctx.stroke();
  },

  drawCircle(minute, options) {
    const radius = options.size * baseRadius;
    const center = this.getRadialPoint(minute, options.offset);

    ctx.fillStyle = options.fillColor;
    ctx.strokeStyle = options.lineColor;
    ctx.lineWidth = options.thickness * basePixelSize;
    ctx.beginPath();
    ctx.arc(center.x, center.y, radius, 0, 2 * Math.PI);
    ctx.fill();
    ctx.stroke();
  }
}

function renderClockFace() {
  utils.drawCircle(0, CLOCK_FACE);

  for (let minute = 0; minute < 60; minute++) {
    if (minute % 5 === 0) {
      utils.drawRadialSegment(minute, LARGE_TICK);
    } else {
      utils.drawRadialSegment(minute, SMALL_TICK);
    }
  }
}

function renderHourHand(time) {
  const hours = (time.getHours() + (time.getMinutes() / 60)) % 12;
  const minuteMark = hours * 5;
  utils.drawRadialSegment(minuteMark, HOUR_HAND);
}

function renderMinuteHand(time) {
  const minuteMark = time.getMinutes() + time.getSeconds() / 60;
  utils.drawRadialSegment(minuteMark, MINUTE_HAND);
}

function renderSecondHand(time) {
  const minuteMark = time.getSeconds();
  utils.drawRadialSegment(minuteMark, SECOND_HAND);
  utils.drawCircle(minuteMark, SECOND_INDICATOR);
  utils.drawCircle(minuteMark, SECOND_HAND_BASE);
  utils.drawCircle(minuteMark, CENTRAL_SCREW);
}

function render() {
  const time = new Date();
  utils.setCanvasSize();
  renderClockFace();
  renderHourHand(time);
  renderMinuteHand(time);
  renderSecondHand(time);
}

function initialize() {
  const onResize = utils.throttle(render, 100);
  window.addEventListener('resize', onResize);
  setInterval(render, 1000);
}

initialize();
