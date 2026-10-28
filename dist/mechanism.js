(function () {
  'use strict';

  /** A small, self-contained gear study. Returns a cleanup function. */
  window.mountMechanism = function mountMechanism(canvas, options) {
    if (!canvas || typeof canvas.getContext !== 'function') return function () {};
    if (typeof canvas._unmountMechanism === 'function') canvas._unmountMechanism();

    var context = canvas.getContext('2d');
    if (!context) return function () {};

    var settings = options || {};
    var speedControl = document.getElementById(settings.speedId || 'mechanism-speed');
    var toggleControl = document.getElementById(settings.toggleId || 'mechanism-toggle');
    var rpmOutput = document.getElementById(settings.rpmId || 'mechanism-rpm');
    var motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
    var running = !motionPreference.matches;
    var visible = true;
    var disposed = false;
    var frame = 0;
    var lastTime = 0;
    var angle = 0.08;
    var width = 460;
    var height = 330;
    var dpr = 1;
    var rpm = speedToRpm(speedControl ? Number(speedControl.value) : 35);
    var ink = '#243d34';
    var orange = '#e66a3b';
    var paper = '#f6f2e9';
    var centerA = { x: 167, y: 177 };
    var contactAngle = -0.23;
    var centerB = {
      x: centerA.x + Math.cos(contactAngle) * 130,
      y: centerA.y + Math.sin(contactAngle) * 130
    };

    function speedToRpm(value) {
      return Math.max(0, Math.min(24, Number(value) * 0.24 || 0));
    }

    function circle(x, y, radius, fill, stroke, lineWidth) {
      context.beginPath();
      context.arc(x, y, radius, 0, Math.PI * 2);
      if (fill) {
        context.fillStyle = fill;
        context.fill();
      }
      if (stroke) {
        context.strokeStyle = stroke;
        context.lineWidth = lineWidth || 1;
        context.stroke();
      }
    }

    function line(x1, y1, x2, y2, color, lineWidth) {
      context.beginPath();
      context.moveTo(x1, y1);
      context.lineTo(x2, y2);
      context.strokeStyle = color || ink;
      context.lineWidth = lineWidth || 1;
      context.stroke();
    }

    function label(text, x, y, color, size, align) {
      context.fillStyle = color || ink;
      context.font = '500 ' + (size || 10) + 'px "IBM Plex Mono", "SFMono-Regular", Consolas, monospace';
      context.textAlign = align || 'left';
      context.textBaseline = 'middle';
      context.fillText(text, x, y);
    }

    // The gently tapered flanks approximate a cut spur gear at this scale.
    function gearPath(teeth, pitchRadius, phase) {
      var step = Math.PI * 2 / teeth;
      var addendum = 4.8;
      var root = pitchRadius - 6.1;
      var outer = pitchRadius + addendum;
      var points = [
        [-0.5, root], [-0.34, root], [-0.25, pitchRadius - 1.6],
        [-0.17, outer], [0.17, outer], [0.25, pitchRadius - 1.6],
        [0.34, root], [0.5, root]
      ];
      context.beginPath();
      for (var tooth = 0; tooth < teeth; tooth += 1) {
        for (var point = 0; point < points.length; point += 1) {
          var theta = phase + step * (tooth + points[point][0]);
          var radius = points[point][1];
          var x = Math.cos(theta) * radius;
          var y = Math.sin(theta) * radius;
          if (tooth === 0 && point === 0) context.moveTo(x, y);
          else context.lineTo(x, y);
        }
      }
      context.closePath();
    }

    function gear(center, teeth, radius, phase, primary) {
      context.save();
      context.translate(center.x, center.y);

      // An offset cut edge gives depth without a heavy three-dimensional scene.
      context.save();
      context.translate(0, 4);
      gearPath(teeth, radius, phase);
      context.fillStyle = primary ? '#b64f2b' : '#132a22';
      context.fill();
      context.restore();

      gearPath(teeth, radius, phase);
      context.fillStyle = primary ? orange : ink;
      context.fill();
      context.strokeStyle = primary ? '#a54729' : '#122a20';
      context.lineWidth = 1.2;
      context.lineJoin = 'round';
      context.stroke();

      // Pitch circles make the rolling relationship legible.
      context.setLineDash([2, 4]);
      circle(0, 0, radius, null, primary ? 'rgba(70, 40, 21, .30)' : 'rgba(246, 242, 233, .32)', 0.8);
      context.setLineDash([]);
      circle(0, 0, radius - 13, null, primary ? 'rgba(90, 39, 19, .24)' : 'rgba(246, 242, 233, .24)', 1);

      context.save();
      context.rotate(phase);
      var holes = primary ? 6 : 4;
      var holeDistance = primary ? 45 : 29;
      var holeRadius = primary ? 12.3 : 7.1;
      for (var index = 0; index < holes; index += 1) {
        var holeAngle = index * Math.PI * 2 / holes;
        var hx = Math.cos(holeAngle) * holeDistance;
        var hy = Math.sin(holeAngle) * holeDistance;
        circle(hx, hy, holeRadius, paper, primary ? '#b75430' : '#10291f', 1);
        context.beginPath();
        context.arc(hx, hy + 1, holeRadius - 0.4, Math.PI, Math.PI * 2);
        context.strokeStyle = primary ? 'rgba(95, 47, 25, .20)' : 'rgba(12, 30, 22, .22)';
        context.lineWidth = 2;
        context.stroke();
      }
      // A single small index mark helps the eye follow the moving part.
      line(radius - 21, 0, radius - 9, 0, primary ? paper : orange, 2.2);
      context.restore();

      circle(0, 0, primary ? 24 : 19, primary ? '#e9855a' : '#3c574b', primary ? '#b6512e' : '#152f24', 1);
      circle(0, 0, primary ? 16 : 12.5, paper, ink, 1.2);
      circle(0, 0, primary ? 7 : 5.5, ink);
      line(-3.4, -3.4, 3.4, 3.4, paper, 1);
      context.restore();
    }

    function arrowArc(cx, cy, radius, start, end, color) {
      context.beginPath();
      context.arc(cx, cy, radius, start, end, end < start);
      context.strokeStyle = color;
      context.lineWidth = 1.1;
      context.stroke();
      var direction = end > start ? 1 : -1;
      var x = cx + Math.cos(end) * radius;
      var y = cy + Math.sin(end) * radius;
      var tangent = end + direction * Math.PI / 2;
      context.beginPath();
      context.moveTo(x, y);
      context.lineTo(x - Math.cos(tangent - 0.48) * 6, y - Math.sin(tangent - 0.48) * 6);
      context.moveTo(x, y);
      context.lineTo(x - Math.cos(tangent + 0.48) * 6, y - Math.sin(tangent + 0.48) * 6);
      context.stroke();
    }

    function crosshair(center, length) {
      var faintInk = 'rgba(36, 61, 52, .27)';
      line(center.x - length, center.y, center.x - 12, center.y, faintInk, 0.7);
      line(center.x + 12, center.y, center.x + length, center.y, faintInk, 0.7);
      line(center.x, center.y - length, center.x, center.y - 12, faintInk, 0.7);
      line(center.x, center.y + 12, center.x, center.y + length, faintInk, 0.7);
    }

    function draw() {
      if (disposed || width <= 0 || height <= 0) return;
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      context.clearRect(0, 0, width, height);
      var scale = Math.min(width / 460, height / 330);
      context.translate((width - 460 * scale) / 2, (height - 330 * scale) / 2);
      context.scale(scale, scale);

      // Registration marks and a sparse drafting grid.
      context.fillStyle = 'rgba(36, 61, 52, .14)';
      for (var gx = 36; gx < 440; gx += 20) {
        for (var gy = 37; gy < 305; gy += 20) {
          context.fillRect(gx, gy, 0.9, 0.9);
        }
      }
      label('ROTATION STUDY', 28, 22, 'rgba(36, 61, 52, .62)', 9);
      label('01 / 02', 430, 22, 'rgba(36, 61, 52, .45)', 9, 'right');

      var nx = -Math.sin(contactAngle);
      var ny = Math.cos(contactAngle);
      var offset = -104;
      var da = { x: centerA.x + nx * offset, y: centerA.y + ny * offset };
      var db = { x: centerB.x + nx * offset, y: centerB.y + ny * offset };
      var dimensionColor = 'rgba(36, 61, 52, .35)';
      line(centerA.x + nx * -84, centerA.y + ny * -84, da.x + nx * -8, da.y + ny * -8, dimensionColor, 0.7);
      line(centerB.x + nx * -60, centerB.y + ny * -60, db.x + nx * -8, db.y + ny * -8, dimensionColor, 0.7);
      line(da.x, da.y, db.x, db.y, dimensionColor, 0.7);
      line(da.x - 3, da.y + 5, da.x + 3, da.y - 5, ink, 0.8);
      line(db.x - 3, db.y + 5, db.x + 3, db.y - 5, ink, 0.8);
      context.save();
      context.translate((da.x + db.x) / 2, (da.y + db.y) / 2);
      context.rotate(contactAngle);
      context.fillStyle = paper;
      context.fillRect(-29, -8, 58, 16);
      label('3 : 2', 0, 0, ink, 10, 'center');
      context.restore();

      context.setLineDash([5, 4]);
      line(centerA.x - 98 * Math.cos(contactAngle), centerA.y - 98 * Math.sin(contactAngle),
        centerB.x + 70 * Math.cos(contactAngle), centerB.y + 70 * Math.sin(contactAngle),
        'rgba(36, 61, 52, .17)', 0.7);
      context.setLineDash([]);

      // The smaller gear turns in the opposite direction, 30 / 20 times faster.
      gear(centerA, 30, 78, contactAngle + angle, true);
      gear(centerB, 20, 52, contactAngle + Math.PI + Math.PI / 20 - angle * 1.5, false);

      crosshair(centerA, 29);
      crosshair(centerB, 24);
      arrowArc(centerA.x, centerA.y, 95, 2.67, 3.75, 'rgba(36, 61, 52, .55)');
      arrowArc(centerB.x, centerB.y, 70, 0.52, -0.52, 'rgba(36, 61, 52, .55)');

      // Quiet labels stay fixed while the machinery moves.
      line(centerA.x, centerA.y + 87, centerA.x, 285, dimensionColor, 0.7);
      line(centerB.x, centerB.y + 62, centerB.x, 251, dimensionColor, 0.7);
      circle(centerA.x, 285, 2, orange);
      circle(centerB.x, 251, 2, ink);
      label('30 TEETH', centerA.x + 9, 286, ink, 9);
      label('20 TEETH', centerB.x + 9, 252, ink, 9);
      label('INPUT', 29, 310, 'rgba(36, 61, 52, .50)', 9);
      label('OUTPUT × 1.5', 430, 310, 'rgba(36, 61, 52, .50)', 9, 'right');
    }

    function updateControls() {
      if (toggleControl) {
        toggleControl.setAttribute('aria-pressed', String(running));
        // Preserve any decorative icons inside the control.
        var labelNode = toggleControl.querySelector('[data-mechanism-label]');
        if (labelNode) labelNode.textContent = running ? 'Pause' : 'Play';
        else toggleControl.textContent = running ? 'Pause' : 'Play';
        var iconNode = toggleControl.querySelector('[data-mechanism-icon]');
        if (iconNode) iconNode.textContent = running ? 'Ⅱ' : '▷';
        toggleControl.setAttribute('aria-label', running ? 'Pause the gear experiment' : 'Play the gear experiment');
      }
      if (rpmOutput) {
        var value = rpm.toFixed(1);
        if ('value' in rpmOutput) rpmOutput.value = value;
        rpmOutput.textContent = value;
      }
    }

    function canAnimate() {
      return running && visible && !document.hidden && rpm > 0 && !disposed;
    }

    function tick(now) {
      frame = 0;
      if (!canAnimate()) {
        lastTime = 0;
        return;
      }
      if (lastTime) {
        var elapsed = Math.min(0.05, (now - lastTime) / 1000);
        angle = (angle + elapsed * rpm * Math.PI * 2 / 60) % (Math.PI * 4);
      }
      lastTime = now;
      draw();
      frame = window.requestAnimationFrame(tick);
    }

    function synchronizeAnimation() {
      if (canAnimate()) {
        if (!frame) {
          lastTime = 0;
          frame = window.requestAnimationFrame(tick);
        }
      } else if (frame) {
        window.cancelAnimationFrame(frame);
        frame = 0;
        lastTime = 0;
      }
    }

    function resize() {
      var bounds = canvas.getBoundingClientRect();
      width = bounds.width || 460;
      height = bounds.height || 330;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      draw();
    }

    function onSpeedInput() {
      rpm = speedToRpm(speedControl.value);
      updateControls();
      draw();
      synchronizeAnimation();
    }

    function onToggle() {
      running = !running;
      updateControls();
      synchronizeAnimation();
    }

    function onMotionPreferenceChange(event) {
      if (event.matches) {
        running = false;
        updateControls();
        synchronizeAnimation();
        draw();
      }
    }

    var resizeObserver = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(resize) : null;
    var visibilityObserver = typeof IntersectionObserver !== 'undefined' ? new IntersectionObserver(function (entries) {
      visible = entries[0].isIntersecting;
      synchronizeAnimation();
    }, { rootMargin: '50px' }) : null;

    if (speedControl) speedControl.addEventListener('input', onSpeedInput);
    if (toggleControl) toggleControl.addEventListener('click', onToggle);
    if (resizeObserver) resizeObserver.observe(canvas);
    else window.addEventListener('resize', resize);
    if (visibilityObserver) visibilityObserver.observe(canvas);
    document.addEventListener('visibilitychange', synchronizeAnimation);
    if (motionPreference.addEventListener) motionPreference.addEventListener('change', onMotionPreferenceChange);
    else if (motionPreference.addListener) motionPreference.addListener(onMotionPreferenceChange);
    resize();
    updateControls();
    synchronizeAnimation();

    var cleanup = function () {
      disposed = true;
      if (frame) window.cancelAnimationFrame(frame);
      if (resizeObserver) resizeObserver.disconnect();
      else window.removeEventListener('resize', resize);
      if (visibilityObserver) visibilityObserver.disconnect();
      if (speedControl) speedControl.removeEventListener('input', onSpeedInput);
      if (toggleControl) toggleControl.removeEventListener('click', onToggle);
      document.removeEventListener('visibilitychange', synchronizeAnimation);
      if (motionPreference.removeEventListener) motionPreference.removeEventListener('change', onMotionPreferenceChange);
      else if (motionPreference.removeListener) motionPreference.removeListener(onMotionPreferenceChange);
      if (canvas._unmountMechanism === cleanup) delete canvas._unmountMechanism;
    };
    canvas._unmountMechanism = cleanup;
    return cleanup;
  };
}());
