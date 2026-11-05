const DATABASE_NAME = "quickclip-database";
const DATABASE_VERSION = 1;
const IMAGE_STORE_NAME = "images";

function openDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(
      DATABASE_NAME,
      DATABASE_VERSION
    );

    request.onerror = () => {
      reject(request.error);
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onupgradeneeded = () => {
      const database = request.result;

      if (
        !database.objectStoreNames.contains(
          IMAGE_STORE_NAME
        )
      ) {
        database.createObjectStore(
          IMAGE_STORE_NAME,
          {
            keyPath: "id",
          }
        );
      }
    };
  });
}

export async function saveImage(imageId, imageBlob) {
  const database = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = database.transaction(
      IMAGE_STORE_NAME,
      "readwrite"
    );

    const store = transaction.objectStore(
      IMAGE_STORE_NAME
    );

    const request = store.put({
      id: imageId,
      blob: imageBlob,
      updatedAt: new Date().toISOString(),
    });

    request.onsuccess = () => {
      resolve(imageId);
    };

    request.onerror = () => {
      reject(request.error);
    };

    transaction.oncomplete = () => {
      database.close();
    };
  });
}

export async function getImage(imageId) {
  if (!imageId) {
    return null;
  }

  const database = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = database.transaction(
      IMAGE_STORE_NAME,
      "readonly"
    );

    const store = transaction.objectStore(
      IMAGE_STORE_NAME
    );

    const request = store.get(imageId);

    request.onsuccess = () => {
      resolve(request.result?.blob || null);
    };

    request.onerror = () => {
      reject(request.error);
    };

    transaction.oncomplete = () => {
      database.close();
    };
  });
}

export async function deleteImage(imageId) {
  if (!imageId) {
    return;
  }

  const database = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = database.transaction(
      IMAGE_STORE_NAME,
      "readwrite"
    );

    const store = transaction.objectStore(
      IMAGE_STORE_NAME
    );

    const request = store.delete(imageId);

    request.onsuccess = () => {
      resolve();
    };

    request.onerror = () => {
      reject(request.error);
    };

    transaction.oncomplete = () => {
      database.close();
    };
  });
}

export async function convertImageToPng(imageBlob) {
  if (imageBlob.type === "image/png") {
    return imageBlob;
  }

  const imageUrl = URL.createObjectURL(imageBlob);

  try {
    const image = await new Promise(
      (resolve, reject) => {
        const imageElement = new Image();

        imageElement.onload = () => {
          resolve(imageElement);
        };

        imageElement.onerror = () => {
          reject(
            new Error("Ekki tókst að lesa myndina.")
          );
        };

        imageElement.src = imageUrl;
      }
    );

    const canvas = document.createElement("canvas");

    canvas.width = image.naturalWidth;
    canvas.height = image.naturalHeight;

    const context = canvas.getContext("2d");

    context.drawImage(image, 0, 0);

    const pngBlob = await new Promise(
      (resolve, reject) => {
        canvas.toBlob(
          (result) => {
            if (result) {
              resolve(result);
            } else {
              reject(
                new Error(
                  "Ekki tókst að breyta myndinni í PNG."
                )
              );
            }
          },
          "image/png"
        );
      }
    );

    return pngBlob;
  } finally {
    URL.revokeObjectURL(imageUrl);
  }
}

export function blobToDataUrl(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      resolve(reader.result);
    };

    reader.onerror = () => {
      reject(reader.error);
    };

    reader.readAsDataURL(blob);
  });
}