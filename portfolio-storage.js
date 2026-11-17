(function (root) {
  "use strict";

  const DATABASE_NAME = "deng-chunbin-portfolio";
  const DATABASE_VERSION = 1;
  const STORE_NAME = "portfolio";
  const RECORD_KEY = "current";
  const ZIP32_MAX = 0xffffffff;
  const encoder = new TextEncoder();

  function storageError(error, action) {
    let reason = error && error.message ? error.message : "浏览器存储操作失败。";
    if (error && error.name === "QuotaExceededError") {
      reason = "浏览器存储空间不足，请减少附件大小或清理本站的旧附件后重试。";
    } else if (error && (error.name === "SecurityError" || error.name === "InvalidStateError")) {
      reason = "浏览器禁止使用本地存储，请检查隐私设置，或通过 localhost / HTTPS 打开网站。";
    } else if (error && error.name === "DataCloneError") {
      reason = "作品数据包含无法保存的内容，请仅保存普通数据以及 File / Blob 附件。";
    } else if (error && error.name === "AbortError") {
      reason = "本地存储事务已中止，请重新尝试。";
    }
    const result = new Error(action + "：" + reason);
    result.cause = error;
    return result;
  }

  function openDatabase() {
    return new Promise(function (resolve, reject) {
      if (!root.indexedDB) {
        reject(new Error("当前浏览器不支持 IndexedDB 本地存储，请使用最新版浏览器。"));
        return;
      }
      let request;
      let settled = false;
      try {
        request = root.indexedDB.open(DATABASE_NAME, DATABASE_VERSION);
      } catch (error) {
        reject(error);
        return;
      }
      request.onupgradeneeded = function () {
        const database = request.result;
        if (!database.objectStoreNames.contains(STORE_NAME)) {
          database.createObjectStore(STORE_NAME);
        }
      };
      request.onsuccess = function () {
        const database = request.result;
        if (settled) {
          database.close();
          return;
        }
        settled = true;
        database.onversionchange = function () { database.close(); };
        resolve(database);
      };
      request.onerror = function () {
        if (!settled) {
          settled = true;
          reject(request.error || new Error("无法打开本地作品数据库。"));
        }
      };
      request.onblocked = function () {
        if (!settled) {
          settled = true;
          reject(new Error("本地数据库正在被其他页面使用，请关闭本站的其他标签页后重试。"));
        }
      };
    });
  }

  async function transact(mode, operation) {
    const database = await openDatabase();
    try {
      return await new Promise(function (resolve, reject) {
        let transaction;
        let value;
        let requestError;
        try {
          transaction = database.transaction(STORE_NAME, mode);
          transaction.oncomplete = function () { resolve(value); };
          transaction.onabort = function () {
            reject(requestError || transaction.error || new Error("本地存储事务已中止。"));
          };
          transaction.onerror = function () {
            requestError = transaction.error || requestError;
          };
          const request = operation(transaction.objectStore(STORE_NAME));
          request.onsuccess = function () { value = request.result; };
          request.onerror = function () { requestError = request.error; };
        } catch (error) {
          if (transaction) {
            try { transaction.abort(); } catch (_) { /* Already inactive. */ }
          }
          reject(error);
        }
      });
    } finally {
      database.close();
    }
  }

  async function load() {
    try {
      const result = await transact("readonly", function (store) { return store.get(RECORD_KEY); });
      return result === undefined ? null : result;
    } catch (error) {
      throw storageError(error, "无法读取作品");
    }
  }

  async function save(data) {
    try {
      if (!data || typeof data.profile !== "object" || data.profile === null ||
          Array.isArray(data.profile) || !Array.isArray(data.projects)) {
        throw new Error("请提供包含 profile 对象和 projects 数组的作品数据。");
      }
      const record = { profile: data.profile, projects: data.projects };
      await transact("readwrite", function (store) { return store.put(record, RECORD_KEY); });
    } catch (error) {
      throw storageError(error, "无法保存作品");
    }
  }

  async function clear() {
    try {
      // This only removes the browser's record. It never touches source files.
      await transact("readwrite", function (store) { return store.delete(RECORD_KEY); });
    } catch (error) {
      throw storageError(error, "无法清除本地作品");
    }
  }

  const crcTable = new Uint32Array(256);
  for (let index = 0; index < crcTable.length; index += 1) {
    let value = index;
    for (let bit = 0; bit < 8; bit += 1) {
      value = (value & 1) ? (0xedb88320 ^ (value >>> 1)) : (value >>> 1);
    }
    crcTable[index] = value >>> 0;
  }

  function updateCrc(crc, bytes) {
    for (let index = 0; index < bytes.length; index += 1) {
      crc = crcTable[(crc ^ bytes[index]) & 0xff] ^ (crc >>> 8);
    }
    return crc;
  }

  async function blobCrc(blob) {
    let crc = ZIP32_MAX;
    if (typeof blob.stream === "function") {
      const reader = blob.stream().getReader();
      try {
        while (true) {
          const chunk = await reader.read();
          if (chunk.done) break;
          crc = updateCrc(crc, chunk.value);
        }
      } finally {
        reader.releaseLock();
      }
    } else {
      // Slice the fallback path too, so large Demo packages need no full copy.
      const chunkSize = 4 * 1024 * 1024;
      for (let offset = 0; offset < blob.size; offset += chunkSize) {
        crc = updateCrc(crc, new Uint8Array(await blob.slice(offset, offset + chunkSize).arrayBuffer()));
      }
    }
    return (crc ^ ZIP32_MAX) >>> 0;
  }

  function validateName(name) {
    if (typeof name !== "string" || !name || name.startsWith("/") ||
        name.includes("\\") || name.includes(":") || /[\u0000-\u001f\u007f]/.test(name)) {
      throw new Error("ZIP 文件名必须是安全的相对路径，不可包含绝对路径、反斜杠或控制字符。");
    }
    const parts = name.split("/");
    if (parts.some(function (part) { return !part || part === "." || part === ".."; })) {
      throw new Error("ZIP 路径不可包含空目录、. 或 ..：" + name);
    }
    const bytes = encoder.encode(name);
    if (bytes.length > 0xffff) throw new Error("ZIP 文件名过长：" + name);
    return bytes;
  }

  function zipDate(date) {
    const year = Math.max(1980, Math.min(2107, date.getFullYear()));
    return {
      time: (date.getHours() << 11) | (date.getMinutes() << 5) | (date.getSeconds() >>> 1),
      date: ((year - 1980) << 9) | ((date.getMonth() + 1) << 5) | date.getDate()
    };
  }

  async function makeZip(files) {
    try {
      if (!Array.isArray(files)) throw new Error("请提供 ZIP 文件列表。");
      if (files.length > 0xffff) throw new Error("ZIP 文件数量超过 65,535 个，请减少文件数量。");

      const entries = [];
      const usedNames = new Set();
      let localSize = 0;
      let centralSize = 0;
      // Validate every path and size before reading any attachment bytes.
      for (const file of files) {
        if (!file || typeof file !== "object") throw new Error("ZIP 文件列表包含无效条目。");
        const nameBytes = validateName(file.name);
        if (usedNames.has(file.name)) throw new Error("ZIP 文件路径重复：" + file.name);
        usedNames.add(file.name);
        const data = file.data;
        if (!(data instanceof Blob) && typeof data !== "string" && !(data instanceof Uint8Array)) {
          throw new Error("ZIP 内容必须是 Blob、字符串或 Uint8Array：" + file.name);
        }
        const blob = data instanceof Blob ? data : new Blob([data]);
        if (blob.size > ZIP32_MAX) throw new Error("单个文件超过 ZIP32 的 4 GB 限制：" + file.name);
        const offset = localSize;
        localSize += 30 + nameBytes.length + blob.size;
        centralSize += 46 + nameBytes.length;
        if (localSize + centralSize + 22 > ZIP32_MAX) {
          throw new Error("导出包超过 ZIP32 的 4 GB 限制，请缩小 Demo 附件。");
        }
        entries.push({ nameBytes: nameBytes, blob: blob, offset: offset });
      }

      const localParts = [];
      const centralParts = [];
      const modified = zipDate(new Date());
      for (const entry of entries) {
        const crc = await blobCrc(entry.blob);
        const localHeader = new Uint8Array(30);
        const local = new DataView(localHeader.buffer);
        local.setUint32(0, 0x04034b50, true);
        local.setUint16(4, 20, true);
        local.setUint16(6, 0x0800, true); // File names are UTF-8.
        local.setUint16(8, 0, true); // Stored, without compression.
        local.setUint16(10, modified.time, true);
        local.setUint16(12, modified.date, true);
        local.setUint32(14, crc, true);
        local.setUint32(18, entry.blob.size, true);
        local.setUint32(22, entry.blob.size, true);
        local.setUint16(26, entry.nameBytes.length, true);
        localParts.push(localHeader, entry.nameBytes, entry.blob);

        const centralHeader = new Uint8Array(46);
        const central = new DataView(centralHeader.buffer);
        central.setUint32(0, 0x02014b50, true);
        central.setUint16(4, 20, true);
        central.setUint16(6, 20, true);
        central.setUint16(8, 0x0800, true);
        central.setUint16(10, 0, true);
        central.setUint16(12, modified.time, true);
        central.setUint16(14, modified.date, true);
        central.setUint32(16, crc, true);
        central.setUint32(20, entry.blob.size, true);
        central.setUint32(24, entry.blob.size, true);
        central.setUint16(28, entry.nameBytes.length, true);
        central.setUint32(42, entry.offset, true);
        centralParts.push(centralHeader, entry.nameBytes);
      }

      const endHeader = new Uint8Array(22);
      const end = new DataView(endHeader.buffer);
      end.setUint32(0, 0x06054b50, true);
      end.setUint16(8, entries.length, true);
      end.setUint16(10, entries.length, true);
      end.setUint32(12, centralSize, true);
      end.setUint32(16, localSize, true);
      return new Blob(localParts.concat(centralParts, [endHeader]), { type: "application/zip" });
    } catch (error) {
      const result = new Error("无法导出作品包：" + (error && error.message ? error.message : "ZIP 生成失败。"));
      result.cause = error;
      throw result;
    }
  }

  root.PortfolioStorage = Object.freeze({ load: load, save: save, clear: clear, makeZip: makeZip });
})(typeof window !== "undefined" ? window : globalThis);
