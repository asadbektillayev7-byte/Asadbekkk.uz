(() => {
  const VERSION = 1;
  const DEFAULT_KEY = "asadbekkk:visit-opening:v1";
  const memory = new Map();
  const unavailable = new Set();
  const isRecord = value => value !== null && typeof value === "object" && !Array.isArray(value);
  const uniqueStrings = values => [...new Set(values.filter(value => typeof value === "string" && value.length > 0))];

  function shuffle(values) {
    const result = [...values];
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }

  function read(key) {
    if (unavailable.has(key)) return memory.get(key);
    try {
      const raw = window.localStorage.getItem(key);
      if (!raw) return memory.get(key);
      try {
        const state = JSON.parse(raw);
        return isRecord(state) && state.version === VERSION ? state : undefined;
      } catch {
        return undefined;
      }
    } catch {
      unavailable.add(key);
      return memory.get(key);
    }
  }

  function draw(saved, ids) {
    const previous = isRecord(saved) ? saved : {};
    const last = ids.includes(previous.last) ? previous.last : null;
    const sameIds = Array.isArray(previous.ids)
      && previous.ids.length === ids.length
      && new Set(previous.ids).size === ids.length
      && previous.ids.every(id => ids.includes(id));
    const validBag = Array.isArray(previous.remaining)
      && new Set(previous.remaining).size === previous.remaining.length
      && previous.remaining.every(id => ids.includes(id) && id !== last);
    let remaining = sameIds && validBag ? [...previous.remaining] : [];
    if (!remaining.length) {
      remaining = shuffle(ids);
      if (remaining.length > 1 && remaining[0] === last) {
        const swap = 1 + Math.floor(Math.random() * (remaining.length - 1));
        [remaining[0], remaining[swap]] = [remaining[swap], remaining[0]];
      }
    }
    const value = remaining.shift() ?? null;
    return { value, state: { ids: [...ids], remaining, last: value } };
  }

  window.chooseVisitOpening = function chooseVisitOpening({ photos = [], variantIds = [], storageKey = DEFAULT_KEY } = {}) {
    const activePhotos = Array.isArray(photos) ? photos : [];
    const photoIds = uniqueStrings(activePhotos.map(photo => photo?.src));
    const motionIds = uniqueStrings(Array.isArray(variantIds) ? variantIds : []);
    const key = typeof storageKey === "string" && storageKey ? storageKey : DEFAULT_KEY;
    const saved = read(key);
    const photo = draw(saved?.photo, photoIds);
    const motion = draw(saved?.motion, motionIds);
    const state = { version: VERSION, photo: photo.state, motion: motion.state };
    memory.set(key, state);
    if (!unavailable.has(key)) {
      try {
        window.localStorage.setItem(key, JSON.stringify(state));
      } catch {
        unavailable.add(key);
      }
    }
    return {
      photoIndex: photo.value === null ? -1 : activePhotos.findIndex(item => item?.src === photo.value),
      variantId: motion.value
    };
  };
})();
