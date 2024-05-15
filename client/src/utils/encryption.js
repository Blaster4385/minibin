async function generateAESKey() {
  try {
    const key = await window.crypto.subtle.generateKey(
      { name: "AES-GCM", length: 256 },
      true,
      ["encrypt", "decrypt"],
    );
    return key;
  } catch (error) {
    console.error("Error generating AES key:", error);
    throw error;
  }
}

async function keyToString(key) {
  try {
    const exportedKey = await window.crypto.subtle.exportKey("raw", key);
    return btoa(String.fromCharCode(...new Uint8Array(exportedKey)))
      .replace(/\+/g, "-")
      .replace(/\//g, "_");
  } catch (error) {
    console.error("Error converting key to string:", error);
    throw error;
  }
}

async function stringToKey(keyString) {
  try {
    const originalKeyString = keyString.replace(/-/g, "+").replace(/_/g, "/");
    const buffer = Uint8Array.from(atob(originalKeyString), (c) =>
      c.charCodeAt(0),
    ).buffer;

    return await window.crypto.subtle.importKey(
      "raw",
      buffer,
      { name: "AES-GCM", length: 256 },
      true,
      ["encrypt", "decrypt"],
    );
  } catch (error) {
    console.error("Error converting string to key:", error);
    throw error;
  }
}

async function encryptAES(plaintext, key) {
  try {
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    const encrypted = await window.crypto.subtle.encrypt(
      { name: "AES-GCM", iv: iv },
      key,
      new TextEncoder().encode(plaintext),
    );
    return { encrypted, iv };
  } catch (error) {
    console.error("Error encrypting:", error);
    throw error;
  }
}

async function decryptAES(encrypted, key, iv) {
  try {
    const decrypted = await window.crypto.subtle.decrypt(
      { name: "AES-GCM", iv: iv },
      key,
      encrypted,
    );
    return new TextDecoder().decode(decrypted);
  } catch (error) {
    console.error("Error decrypting:", error);
    throw error;
  }
}

export { generateAESKey, keyToString, stringToKey, encryptAES, decryptAES };
