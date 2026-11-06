import { useEffect, useMemo, useState } from "react";
import "./App.css";
import {
  blobToDataUrl,
  convertImageToPng,
  deleteImage,
  getImage,
  saveImage,
} from "./imageDatabase";

const STORAGE_KEY = "quickclip-items";

const CATEGORY_STORAGE_KEY = "quickclip-categories";

const categoryIcons = [
  { id: "boxes", file: "boxes.svg", name: "Kassar" },
  { id: "jira", file: "jira.svg", name: "Jira" },
  { id: "mynd", file: "mynd.svg", name: "Mynd" },
  { id: "personulegt", file: "personulegt.svg", name: "Persónulegt" },
  { id: "star", file: "star.svg", name: "Stjarna" },
  { id: "ugla", file: "ugla.svg", name: "Ugla" },
  { id: "zendesk", file: "zendesk.svg", name: "Zendesk" },
];

const defaultCategories = [
  {
    id: "all",
    name: "Allt efni",
    icon: "▦",
    iconFile: "boxes.svg",
  },
  {
    id: "favorites",
    name: "Uppáhald",
    icon: "★",
    iconFile: "star.svg",
  },
  {
    id: "work",
    name: "Vinna",
    icon: "💼",
    iconFile: "work.svg",
  },
  { id: "ugla", name: "Ugla", icon: "🎓" },
  { id: "canvas", name: "Canvas", icon: "◉" },
  { id: "m365", name: "Microsoft 365", icon: "⊞" },
  { id: "login", name: "Innskráning", icon: "🔑" },
  { id: "jira", name: "Jira", icon: "◆" },
  { id: "zendesk", name: "Zendesk", icon: "Z" },
  { id: "email", name: "Tölvupóstsniðmát", icon: "✉" },
  { id: "images", name: "Myndir og lógó", icon: "▣" },
  { id: "personal", name: "Persónulegt", icon: "●" },
];

const defaultItems = [
  {
    id: 1,
    title: "Takk fyrir erindið",
    category: "email",
    icon: "✉",
    content:
      "Takk fyrir erindið. Við munum skoða málið og hafa samband við þig eins fljótt og auðið er.",
    tags: ["tölvupóstur", "vinnusvör"],
    favorite: true,
    type: "Texti",
    uses: 37,
    createdAt: "2026-10-16T09:00:00.000Z",
  },
  {
    id: 2,
    title: "Innskráningarvandi",
    category: "login",
    icon: "🔑",
    content:
      "Reyndu eftirfarandi:\n1. Hreinsa vafracache\n2. Opna Incognito-glugga\n3. Prófa annan vafra\n4. Ef það gengur ekki, hafðu samband aftur.",
    tags: ["innskráning", "ugla", "leiðbeiningar"],
    favorite: true,
    type: "Texti",
    uses: 24,
    createdAt: "2026-10-15T09:00:00.000Z",
  },
  {
    id: 3,
    title: "Ugla – nemandi sér ekki námskeið",
    category: "ugla",
    icon: "🎓",
    content:
      "Ef nemandi sér ekki námskeið í Uglu er mikilvægt að kanna skráningarstöðu og staðfesta að aðgangur sé réttur.",
    tags: ["ugla", "nemendur"],
    favorite: true,
    type: "Texti",
    uses: 18,
    createdAt: "2026-10-14T09:00:00.000Z",
  },
  {
    id: 4,
    title: "Canvas leiðbeining",
    category: "canvas",
    icon: "◉",
    content:
      "Stutt Canvas-leiðbeining. Hér verður síðar hægt að vista og afrita bæði texta og myndir.",
    tags: ["canvas", "mynd", "leiðbeiningar"],
    favorite: false,
    type: "Texti",
    uses: 11,
    createdAt: "2026-10-13T09:00:00.000Z",
  },
  {
    id: 5,
    title: "Teams fundarboð",
    category: "m365",
    icon: "T",
    content:
      "Hér er sniðmát fyrir fundarboð í Teams með tengli og dagskrá.",
    tags: ["teams", "tölvupóstur"],
    favorite: true,
    type: "Texti",
    uses: 9,
    createdAt: "2026-10-12T09:00:00.000Z",
  },
  {
    id: 6,
    title: "Svar í Zendesk",
    category: "zendesk",
    icon: "Z",
    content:
      "Sæl/sæll,\n\nTakk fyrir að hafa samband. Við höfum nú skráð erindið þitt og munum halda þér upplýstum.",
    tags: ["zendesk", "tölvupóstur"],
    favorite: true,
    type: "Texti",
    uses: 28,
    createdAt: "2026-10-11T09:00:00.000Z",
  },
  {
    id: 7,
    title: "SQL – virkir notendur",
    category: "work",
    icon: "</>",
    content:
      "SELECT *\nFROM users\nWHERE active = 1\nORDER BY last_login DESC;",
    tags: ["sql", "gagnagrunnur"],
    favorite: true,
    type: "Kóði",
    uses: 15,
    createdAt: "2026-10-10T09:00:00.000Z",
  },
  {
    id: 8,
    title: "Símanúmer og netfang",
    category: "work",
    icon: "☎",
    content:
      "Háskóli Íslands\nÞjónustuver upplýsingatækni\nSími: +354 525 4444\nNetfang: uts@hi.is",
    tags: ["hí", "samskipti"],
    favorite: true,
    type: "Texti",
    uses: 31,
    createdAt: "2026-10-09T09:00:00.000Z",
  },
  {
    id: 9,
    title: "Flýtisvar – nánari upplýsingar",
    category: "work",
    icon: "💬",
    content:
      "Getur þú sent okkur nánari upplýsingar um vandamálið og, ef mögulegt er, skjáskot af villunni?",
    tags: ["vinnusvör", "aðstoð"],
    favorite: false,
    type: "Texti",
    uses: 13,
    createdAt: "2026-10-08T09:00:00.000Z",
  },
];

const emptyForm = {
  title: "",
  type: "Texti",
  category: "work",
  content: "",
  tagsText: "",
  favorite: false,
  imageFile: null,
  imagePreview: "",
  existingImageId: null,
  removeExistingImage: false,
};

function loadItems() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (!saved) {
      return defaultItems;
    }

    const parsed = JSON.parse(saved);

if (!Array.isArray(parsed)) {
  return defaultItems;
}

return parsed;

  } catch (error) {
    console.error("Villa við lestur úr localStorage:", error);
    return defaultItems;
  }
}

function getCategoryIcon(categoryId, categoryList) {
  const category = categoryList.find(
    (item) => item.id === categoryId
  );

  if (!category) {
    return "▦";
  }

  return category.icon;
}

function getCategory(categoryId, categoryList) {
  return (
    categoryList.find(
      (category) => category.id === categoryId
    ) || null
  );
}

function loadCategories() {
  try {
    const saved = localStorage.getItem(
      CATEGORY_STORAGE_KEY
    );

    if (!saved) {
      return defaultCategories;
    }

    const parsed = JSON.parse(saved);

    if (!Array.isArray(parsed)) {
      return defaultCategories;
    }

    return parsed.map((category) => {
      const defaultCategory = defaultCategories.find(
        (item) => item.id === category.id
      );
    
      if (!defaultCategory) {
        return category;
      }
    
      return {
        ...defaultCategory,
        ...category,
        iconFile:
          category.iconFile ||
          defaultCategory.iconFile ||
          undefined,
      };
    });
  } catch (error) {
    console.error(
      "Ekki tókst að lesa flokka:",
      error
    );

    return defaultCategories;
  }
}

function App() {
  const [items, setItems] = useState(loadItems);
  const [categories, setCategories] = useState(loadCategories);
  const [selectedId, setSelectedId] = useState(null);
  const [activeCategory, setActiveCategory] = useState("all");
  const [activeTag, setActiveTag] = useState("allt");
  const [search, setSearch] = useState("");
  const [sortOrder, setSortOrder] = useState("newest");
  const [copiedId, setCopiedId] = useState(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newItemForm, setNewItemForm] = useState(emptyForm);
  const [formErrors, setFormErrors] = useState({});
  const [editingId, setEditingId] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [editingCategory, setEditingCategory] = useState(null);
  const [deletingCategory, setDeletingCategory] = useState(null);
  const [moveToCategoryId, setMoveToCategoryId] = useState("");
  const [newCategoryForm, setNewCategoryForm] = useState(null);
  const importInputId = "quickclip-import-file";
  const [selectedImageUrl, setSelectedImageUrl] =
  useState("");
  

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (error) {
      console.error("Villa við vistun í localStorage:", error);
    }
  }, [items]);

  useEffect(() => {
    if (!isModalOpen) {
      return;
    }

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        setIsModalOpen(false);
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isModalOpen]);

  useEffect(() => {
    let temporaryUrl = "";
  
    async function loadSelectedImage() {
      if (!selectedItem?.imageId) {
        setSelectedImageUrl("");
        return;
      }
  
      try {
        const blob = await getImage(
          selectedItem.imageId
        );
  
        if (!blob) {
          setSelectedImageUrl("");
          return;
        }
  
        temporaryUrl = URL.createObjectURL(blob);
        setSelectedImageUrl(temporaryUrl);
      } catch (error) {
        console.error(
          "Ekki tókst að sækja mynd:",
          error
        );
  
        setSelectedImageUrl("");
      }
    }
  
    loadSelectedImage();
  
    return () => {
      if (temporaryUrl) {
        URL.revokeObjectURL(temporaryUrl);
      }
    };
  }, [selectedId, items]);

  useEffect(() => {
    try {
      localStorage.setItem(
        CATEGORY_STORAGE_KEY,
        JSON.stringify(categories)
      );
    } catch (error) {
      console.error(
        "Ekki tókst að vista flokka:",
        error
      );
    }
  }, [categories]);

  const selectedItem =
  items.find((item) => item.id === selectedId) || null;

  const tags = useMemo(() => {
    const allTags = [];

    items.forEach((item) => {
      item.tags.forEach((tag) => {
        if (!allTags.includes(tag)) {
          allTags.push(tag);
        }
      });
    });

    return allTags.sort((a, b) => a.localeCompare(b, "is")).slice(0, 8);
  }, [items]);


  
  const filteredItems = useMemo(() => {
    const query = search.toLocaleLowerCase("is").trim();

    let results = items.filter((item) => {
      let categoryMatch = true;

      if (activeCategory === "favorites") {
        categoryMatch = item.favorite;
      } else if (activeCategory !== "all") {
        categoryMatch = item.category === activeCategory;
      }

      const tagMatch =
        activeTag === "allt" || item.tags.includes(activeTag);

      const titleMatch = item.title
        .toLocaleLowerCase("is")
        .includes(query);

      const contentMatch = item.content
        .toLocaleLowerCase("is")
        .includes(query);

      const tagsMatch = item.tags.some((tag) =>
        tag.toLocaleLowerCase("is").includes(query)
      );

      const searchMatch =
        query === "" || titleMatch || contentMatch || tagsMatch;

      return categoryMatch && tagMatch && searchMatch;
    });

    results = [...results];

results.sort((a, b) => {
  // Fest atriði eiga alltaf að vera efst.
  if (a.pinned && !b.pinned) {
    return -1;
  }

  if (!a.pinned && b.pinned) {
    return 1;
  }

  // Innan hvors hóps er síðan raðað eftir valinni röðun.
  if (sortOrder === "used") {
    return (b.uses || 0) - (a.uses || 0);
  }

  if (sortOrder === "az") {
    return a.title.localeCompare(b.title, "is");
  }

  const dateA = new Date(a.createdAt || 0).getTime();
  const dateB = new Date(b.createdAt || 0).getTime();

  return dateB - dateA;
});

    return results;
  }, [items, activeCategory, activeTag, search, sortOrder]);

  function updateNewItemForm(field, value) {
    setNewItemForm((current) => {
      const updatedForm = { ...current };
      updatedForm[field] = value;
      return updatedForm;
    });

    if (formErrors[field]) {
      setFormErrors((current) => {
        const updatedErrors = { ...current };
        updatedErrors[field] = "";
        return updatedErrors;
      });
    }
  }

  function handleImageFile(file) {
    if (!file || !file.type.startsWith("image/")) {
      alert(
        "Veldu myndaskrá, til dæmis PNG, JPG eða WebP."
      );
  
      return;
    }
  
    if (newItemForm.imagePreview) {
      URL.revokeObjectURL(
        newItemForm.imagePreview
      );
    }
  
    const previewUrl = URL.createObjectURL(file);
  
    setNewItemForm((current) => {
      return {
        ...current,
        imageFile: file,
        imagePreview: previewUrl,
        removeExistingImage: false,
      };
    });
  }
  
  function handleImagePaste(event) {
    const clipboardItems =
      event.clipboardData?.items || [];
  
    const imageItem = Array.from(
      clipboardItems
    ).find((item) =>
      item.type.startsWith("image/")
    );
  
    if (!imageItem) {
      return;
    }
  
    event.preventDefault();
  
    const imageFile = imageItem.getAsFile();
  
    if (imageFile) {
      handleImageFile(imageFile);
    }
  }
  
  function removeFormImage() {
    if (newItemForm.imagePreview) {
      URL.revokeObjectURL(
        newItemForm.imagePreview
      );
    }
  
    setNewItemForm((current) => {
      return {
        ...current,
        imageFile: null,
        imagePreview: "",
        removeExistingImage: true,
      };
    });
  }

  function openNewItemModal() {
    setEditingId(null);
  
    setNewItemForm({
      title: "",
      type: "Texti",
      category: "work",
      content: "",
      tagsText: "",
      favorite: false,
      imageFile: null,
      imagePreview: "",
      existingImageId: null,
      removeExistingImage: false,
    });
  
    setFormErrors({});
    setIsModalOpen(true);
  }

  async function openEditItemModal(item) {
    let previewUrl = "";
  
    if (item.imageId) {
      const imageBlob = await getImage(
        item.imageId
      );
  
      if (imageBlob) {
        previewUrl =
          URL.createObjectURL(imageBlob);
      }
    }
  
    setEditingId(item.id);
  
    setNewItemForm({
      title: item.title || "",
      type: item.type || "Texti",
      category: item.category || "work",
      content: item.content || "",
      tagsText: Array.isArray(item.tags)
        ? item.tags.join(", ")
        : "",
      favorite: Boolean(item.favorite),
      imageFile: null,
      imagePreview: previewUrl,
      existingImageId: item.imageId || null,
      removeExistingImage: false,
    });
  
    setFormErrors({});
    setIsModalOpen(true);
  }
  
  function closeNewItemModal() {
      setIsModalOpen(false);
      setEditingId(null);
      setFormErrors({});
    }

    function validateForm() {
      const errors = {};

      if (newItemForm.title.trim() === "") {
        errors.title = "Titill má ekki vera auður.";
      }

      if (newItemForm.category === "") {
        errors.category = "Veldu flokk.";
      }

      if (
        newItemForm.type === "Texti" &&
        newItemForm.content.trim() === ""
      ) {
        errors.content = "Settu inn textann sem á að afrita.";
      }

      setFormErrors(errors);

      return Object.keys(errors).length === 0;
    }

    async function saveNewItem(event) {
      event.preventDefault();

      if (!validateForm()) {
        return;
      }

      let imageId =
      editingId !== null
        ? newItemForm.existingImageId
        : null;
    
    if (
      newItemForm.type !== "Texti" &&
      newItemForm.imageFile
    ) {
      const pngBlob = await convertImageToPng(
        newItemForm.imageFile
      );
    
      imageId =
        imageId ||
        `quickclip-image-${Date.now()}-${crypto.randomUUID()}`;
    
      await saveImage(imageId, pngBlob);
    }
    
    if (
      newItemForm.type === "Texti" ||
      newItemForm.removeExistingImage
    ) {
      if (imageId) {
        await deleteImage(imageId);
      }
    
      imageId = null;
    }

      const cleanedTags = newItemForm.tagsText
        .split(",")
        .map((tag) => tag.trim())
        .map((tag) => {
          if (tag.startsWith("#")) {
            return tag.substring(1);
          }

          return tag;
        })
        .map((tag) => tag.toLocaleLowerCase("is"))
        .filter((tag) => tag !== "");

      const uniqueTags = [...new Set(cleanedTags)];

      if (editingId !== null) {
        setItems((current) =>
          current.map((item) => {
            if (item.id !== editingId) {
              return item;
            }

            return {
              ...item,
              title: newItemForm.title.trim(),
              category: newItemForm.category,
              icon: getCategoryIcon(
                newItemForm.category,
                categories
              ),
              content: newItemForm.content.trim(),
              tags: uniqueTags,
              favorite: newItemForm.favorite,
              type: newItemForm.type,
              updatedAt: new Date().toISOString(),
              imageId: imageId,
            };
          })
        );

        setSelectedId(editingId);
      } else {
        let newId = 1;

        if (items.length > 0) {
          const ids = items.map((item) => Number(item.id) || 0);
          newId = Math.max(...ids) + 1;
        }

        const newItem = {
          id: newId,
          title: newItemForm.title.trim(),
          category: newItemForm.category,
          icon: getCategoryIcon(
            newItemForm.category,
            categories
          ),
          content: newItemForm.content.trim(),
          tags: uniqueTags,
          favorite: newItemForm.favorite,
          type: newItemForm.type,
          uses: 0,
          createdAt: new Date().toISOString(),
          pinned: false,
          imageId: imageId,
        };

        setItems((current) => [newItem, ...current]);
        setSelectedId(newId);
        setActiveCategory("all");
        setActiveTag("allt");
        setSearch("");
        setSortOrder("newest");
      }

      closeNewItemModal();
    }

    async function copyItem(item) {
      try {
        if (item.type === "Texti" || !item.imageId) {
          await navigator.clipboard.writeText(
            item.content
          );
        } else {
          const storedImage = await getImage(
            item.imageId
          );
    
          if (!storedImage) {
            throw new Error("Myndin fannst ekki.");
          }
    
          const pngBlob = await convertImageToPng(
            storedImage
          );
    
          if (item.type === "Mynd") {
            await navigator.clipboard.write([
              new ClipboardItem({
                "image/png": pngBlob,
              }),
            ]);
          } else {
            const imageDataUrl =
              await blobToDataUrl(pngBlob);
    
            const escapedText = item.content
              .replaceAll("&", "&amp;")
              .replaceAll("<", "&lt;")
              .replaceAll(">", "&gt;")
              .replaceAll("\n", "<br>");
    
            const html = `
              <div>
                <div>${escapedText}</div>
                <br>
                <img
                  src="${imageDataUrl}"
                  alt=""
                  style="max-width: 100%; height: auto;"
                >
              </div>
            `;
    
            await navigator.clipboard.write([
              new ClipboardItem({
                "text/html": new Blob(
                  [html],
                  {
                    type: "text/html",
                  }
                ),
                "text/plain": new Blob(
                  [item.content],
                  {
                    type: "text/plain",
                  }
                ),
              }),
            ]);
          }
        }
    
        setCopiedId(item.id);
    
        setItems((current) =>
          current.map((entry) => {
            if (entry.id === item.id) {
              return {
                ...entry,
                uses: (entry.uses || 0) + 1,
              };
            }
    
            return entry;
          })
        );
    
        window.setTimeout(() => {
          setCopiedId(null);
        }, 1400);
      } catch (error) {
        console.error(
          "Ekki tókst að afrita atriðið:",
          error
        );
    
        alert(
          "Ekki tókst að afrita atriðið. Prófaðu Edge eða Chrome og athugaðu hvort vafrinn hafi aðgang að klippiborðinu."
        );
      }
    }

    function toggleFavorite(id) {
      setItems((current) =>
        current.map((item) => {
          if (item.id === id) {
            return {
              ...item,
              favorite: !item.favorite,
            };
          }

          return item;
        })
      );
    }

    function exportBackup() {
      const backup = {
        version: 1,
        exportedAt: new Date().toISOString(),
        items,
      };
    
      const json = JSON.stringify(backup, null, 2);
    
      const blob = new Blob(
        [json],
        { type: "application/json" }
      );
    
      const url = URL.createObjectURL(blob);
    
      const link = document.createElement("a");
    
      const date = new Date()
        .toISOString()
        .slice(0, 10);
    
      link.href = url;
      link.download = `quickclip-backup-${date}.json`;
    
      document.body.appendChild(link);
    
      link.click();
    
      document.body.removeChild(link);
    
      URL.revokeObjectURL(url);
    }

    function importBackup(event) {
      const file = event.target.files?.[0];
    
      if (!file) {
        return;
      }
    
      const reader = new FileReader();
    
      reader.onload = (loadEvent) => {
        try {
          const json = loadEvent.target.result;
    
          const backup = JSON.parse(json);
    
          if (!backup.items || !Array.isArray(backup.items)) {
            alert("Ógild QuickClip backup skrá.");
            return;
          }
    
          const confirmed = window.confirm(
            "Þetta mun yfirskrifa núverandi QuickClip gögn. Viltu halda áfram?"
          );
    
          if (!confirmed) {
            return;
          }
    
          setItems(backup.items);
    
          if (backup.items.length > 0) {
            setSelectedId(backup.items[0].id);
          } else {
            setSelectedId(null);
          }
    
          setActiveCategory("all");
          setActiveTag("allt");
          setSearch("");
    
          alert("Backup endurheimt.");
        } catch (error) {
          console.error(error);
          alert("Ekki tókst að lesa backup skrána.");
        }
      };
    
      reader.readAsText(file);
    
      event.target.value = "";
    }

    async function deleteItem(itemId) {
      const itemToDelete = items.find(
        (item) => item.id === itemId
      );
      
      if (itemToDelete?.imageId) {
        await deleteImage(itemToDelete.imageId);
      }
      const remainingItems = items.filter(
        (item) => item.id !== itemId
      );

      setItems(remainingItems);

      if (selectedId === itemId) {
        setSelectedId(
          remainingItems.length > 0
            ? remainingItems[0].id
            : null
        );
      }

      setDeleteTarget(null);
    }

    function getCategoryCount(categoryId) {
      if (categoryId === "all") {
        return items.length;
      }

      if (categoryId === "favorites") {
        return items.filter((item) => item.favorite).length;
      }

      return items.filter((item) => item.category === categoryId).length;
    }

    return (
      <div className="app-shell">
        <aside className="sidebar">
          <div className="brand">
            <div className="brand-icon">Q</div>

            <div>
              <h1>QuickClip</h1>
              <p>Afritaðu. Límdu. Kláraðu.</p>
            </div>
          </div>

          <nav className="category-list">
            {categories.map((category) => (
              <button
                key={category.id}
                type="button"
                className={
                  activeCategory === category.id
                    ? "category-button active"
                    : "category-button"
                }
                onClick={() => {
                  setActiveCategory(category.id);
                  setActiveTag("allt");
                }}
              >
                <span className="category-icon">
  {category.iconFile ? (
    <img
      src={`${import.meta.env.BASE_URL}icons/categories/${category.iconFile}`}
      alt=""
      className="category-icon-image"
    />
  ) : (
    category.icon
  )}
</span>


                <span>{category.name}</span>
               
                {category.id !== "all" &&
  category.id !== "favorites" && (
    <div className="category-actions">
      <button
        type="button"
        className="category-action-button edit"
        title="Breyta flokki"
        onClick={(event) => {
          event.stopPropagation();
          setEditingCategory(category);
        }}
        >
        <img
          src={`${import.meta.env.BASE_URL}icons/edit.svg`}
          alt=""
          className="category-action-icon"
        />
      </button>

      <button
        type="button"
        className="category-action-button delete"
        title="Eyða flokki"
        onClick={(event) => {
          event.stopPropagation();
          setDeletingCategory(category);
        }}
        >
        <img
          src={`${import.meta.env.BASE_URL}icons/delete.svg`}
          alt=""
          className="category-action-icon"
        />
      </button>
    </div>
  )}


              </button>
            ))}
          </nav>

  <button
  type="button"
  className="new-category"
  onClick={() => {
    setNewCategoryForm({
      name: "",
      icon: "📁",
      iconFile: "",
    });
  }}
>
  <span>＋</span> Nýr flokkur
</button>

          <div className="shortcut-card">
            <div className="shortcut-title">⚡ Flýtileið</div>
            <p>Opna QuickClip hratt</p>
            <kbd>Ctrl + Alt + V</kbd>
          </div>
        </aside>

        <main className="main-area">
          <header className="topbar">
            <label className="search-box">
              <span>⌕</span>

              <input
                type="text"
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                }}
                placeholder="Leita í titlum, efni eða töggum..."
              />

              <kbd>Ctrl + K</kbd>
            </label>

            <button
              type="button"
              className="new-item-button"
              onClick={openNewItemModal}
            >
              ＋ Nýtt atriði
            </button>

            <button
              type="button"
              className="settings-button"
              title="Stillingar"
            >
              ⚙
            </button>
          </header>

          <section className="library">
            <div className="library-heading">
              <div>
                <h2>
                  {categories.find(
                    (category) => category.id === activeCategory
                  )?.name || "Allt efni"}
                </h2>

                <p>{filteredItems.length} atriði</p>
              </div>

              <select
                className="sort-select"
                value={sortOrder}
                onChange={(event) => {
                  setSortOrder(event.target.value);
                }}
              >
                <option value="newest">Nýjast fyrst</option>
                <option value="used">Mest notað</option>
                <option value="az">A–Ö</option>
              </select>
            </div>

            <div className="tag-row">
              <button
                type="button"
                className={activeTag === "allt" ? "tag active" : "tag"}
                onClick={() => {
                  setActiveTag("allt");
                }}
              >
                Allt
              </button>

              {tags.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  className={activeTag === tag ? "tag active" : "tag"}
                  onClick={() => {
                    setActiveTag(tag);
                  }}
                >
                  #{tag}
                </button>
              ))}
            </div>

            <div className="card-grid">
              {filteredItems.map((item) => (
                <article
                  key={item.id}
                  className={
                    selectedId === item.id
                      ? "clip-card selected"
                      : "clip-card"
                  }
                  onClick={() => {
                    setSelectedId(item.id);
                  }}
                >
                  <div className="card-heading">
                    <div className="card-title-wrap">
                    <div
  className={
    "item-icon icon-" + item.category
  }
>
  {getCategory(item.category, categories)?.iconFile ? (
    <img
      src={`${import.meta.env.BASE_URL}icons/categories/${
        getCategory(item.category, categories).iconFile
      }`}
      alt=""
      className="item-category-icon-image"
    />
  ) : (
    getCategory(item.category, categories)?.icon ||
    item.icon ||
    "▦"
  )}
</div>

                      <h3>{item.title}</h3>
                    </div>

                    <div
  style={{
    display: "flex",
    alignItems: "center",
    gap: "6px",
  }}
>
  {item.pinned && (
    <span
      title="Fest"
      style={{
        fontSize: "14px",
      }}
    >
      📌
    </span>
  )}

  <button
    type="button"
    className={
      item.favorite
        ? "star-button favorite"
        : "star-button"
    }
    title="Uppáhald"
    onClick={(event) => {
      event.stopPropagation();
      toggleFavorite(item.id);
    }}
  >
    {item.favorite ? "★" : "☆"}
  </button>
</div>

                  </div>

                  <div
                    className={
                      item.type === "Kóði"
                        ? "card-content code-content"
                        : "card-content"
                    }
                  >
                    {item.content}
                  </div>

                  <div className="card-tags">
                    {item.tags.slice(0, 3).map((tag) => (
                      <span key={tag}>#{tag}</span>
                    ))}
                  </div>

                  <div className="card-footer">
                    <button
                      type="button"
                      className={
                        copiedId === item.id
                          ? "copy-button copied"
                          : "copy-button"
                      }
                      onClick={(event) => {
                        event.stopPropagation();
                        copyItem(item);
                      }}
                    >
                      <span>▣</span>

                      {copiedId === item.id
                        ? "Afritað!"
                        : "Afrita"}
                    </button>

                    <span className="shortcut">Ctrl + C</span>

                    <button
                      type="button"
                      className="more-button"
                      onClick={(event) => {
                        event.stopPropagation();
                      }}
                    >
                      •••
                    </button>
                  </div>
                </article>
              ))}

              {filteredItems.length === 0 && (
                <div className="empty-state">
                  <div>⌕</div>
                  <h3>Ekkert fannst</h3>
                  <p>Prófaðu annað leitarorð, tagg eða flokk.</p>
                </div>
              )}
            </div>
          </section>
        </main>

        <aside className="detail-panel">
          {selectedItem && (
            <>
              <div className="detail-heading">
                <div
                  className={
                    "detail-icon icon-" + selectedItem.category
                  }
                >
                  {selectedItem.icon}
                </div>

                <div className="detail-title">
                  <h2>{selectedItem.title}</h2>
                  <span>{selectedItem.type}</span>
                </div>

                <button
                  type="button"
                  className={
                    selectedItem.favorite
                      ? "star-button detail-star favorite"
                      : "star-button detail-star"
                  }
                  onClick={() => {
                    toggleFavorite(selectedItem.id);
                  }}
                >
                  {selectedItem.favorite ? "★" : "☆"}
                </button>
              </div>

              <p className="section-label">Forskoðun</p>

              <div
                className={
                  selectedItem.type === "Kóði"
                    ? "preview-box code-content"
                    : "preview-box"
                }
              >
                {selectedItem.content}
              </div>

              {selectedImageUrl && (
  <div className="detail-image-preview">
    <img
      src={selectedImageUrl}
      alt={selectedItem.title}
    />
  </div>
)}

              <button
                type="button"
                className={
                  copiedId === selectedItem.id
                    ? "big-copy-button copied"
                    : "big-copy-button"
                }
                onClick={() => {
                  copyItem(selectedItem);
                }}
              >
                <span>▣</span>

                {copiedId === selectedItem.id
                  ? "Afritað!"
                  : "Afrita"}

                <small>Ctrl + C</small>
              </button>

              <div className="detail-section">
                <p className="section-label">Tögg</p>

                <div className="detail-tags">
                  {selectedItem.tags.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => {
                        setActiveCategory("all");
                        setActiveTag(tag);
                      }}
                    >
                      #{tag}
                    </button>
                  ))}

                  <button
                    type="button"
                    className="add-tag"
                    onClick={() => {
                      alert(
                        "Breyting á töggum verður hluti af Breyta atriði."
                      );
                    }}
                  >
                    ＋ Bæta við taggi
                  </button>
                </div>
              </div>

              <div className="detail-section">
                <p className="section-label">Aðgerðir</p>

                <button
                  type="button"
                  className="detail-action"
                  onClick={() => {
                    openEditItemModal(selectedItem);
                  }}
                >
                  ✎ <span>Breyta atriði</span>
                </button>
                <button
  type="button"
  className="detail-action"
  onClick={() => {
    setItems((current) =>
      current.map((item) =>
        item.id === selectedItem.id
          ? {
              ...item,
              pinned: !item.pinned,
            }
          : item
      )
    );
  }}
>
  📌

  <span>
    {selectedItem.pinned
      ? "Losa úr festingu"
      : "Festa efst"}
  </span>
</button>
                <button
                  type="button"
                  className="detail-action delete-action"
                  onClick={() => {
                    setDeleteTarget(selectedItem);
                  }}
                >
                  🗑 <span>Eyða atriði</span>
                </button>

                <button
                  type="button"
                  className="detail-action"
                  onClick={() => {
                    toggleFavorite(selectedItem.id);
                  }}
                >
                  ☆
                  <span>
                    {selectedItem.favorite
                      ? "Fjarlægja úr uppáhaldi"
                      : "Bæta í uppáhald"}
                  </span>
                </button>
                <button
  type="button"
  className="detail-action"
  onClick={exportBackup}
>
  💾 <span>Flytja út gögn</span>
</button>

<label
  htmlFor={importInputId}
  className="detail-action"
  style={{ cursor: "pointer" }}
>
  📂 <span>Flytja inn gögn</span>
</label>

<input
  id={importInputId}
  type="file"
  accept=".json"
  onChange={importBackup}
  style={{ display: "none" }}
/>

              </div>

              <div className="metadata">
  <div>
    <span>Notkun</span>
    <strong>{selectedItem.uses || 0} sinnum</strong>
  </div>

  <div>
    <span>Tegund</span>
    <strong>{selectedItem.type}</strong>
  </div>

  <div>
    <span>Búið til</span>
    <strong>
      {selectedItem.createdAt
        ? new Date(selectedItem.createdAt).toLocaleString("is-IS", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })
        : "-"}
    </strong>
  </div>

  <div>
    <span>Síðast breytt</span>
    <strong>
      {selectedItem.updatedAt
        ? new Date(selectedItem.updatedAt).toLocaleString("is-IS", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })
        : "Aldrei"}
    </strong>
  </div>
</div>
            </>
          )}
        </aside>

        {isModalOpen && (
          <div
            className="modal-overlay"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) {
                closeNewItemModal();
              }
            }}
          >
            <form className="modal" onSubmit={saveNewItem}>
              <div className="modal-header">
                <div className="modal-header-left">
                  <div className="modal-header-icon">＋</div>

                  <div>
                    <h2>
                      {editingId !== null
                        ? "Breyta atriði"
                        : "Nýtt atriði"}
                    </h2>

                    <p>
                      {editingId !== null
                        ? "Uppfærðu atriðið og vistaðu breytingarnar"
                        : "Bættu nýju atriði við QuickClip"}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  className="modal-close-button"
                  onClick={closeNewItemModal}
                  aria-label="Loka"
                >
                  ×
                </button>
              </div>

              <div className="modal-body">
                <div className="form-group">
                  <label
                    className="form-label"
                    htmlFor="new-title"
                  >
                    Titill

                    <span className="form-label-description">
                      Stutt og lýsandi heiti
                    </span>
                  </label>

                  <input
                    id="new-title"
                    type="text"
                    className={
                      formErrors.title
                        ? "form-input error"
                        : "form-input"
                    }
                    value={newItemForm.title}
                    onChange={(event) => {
                      updateNewItemForm(
                        "title",
                        event.target.value
                      );
                    }}
                    placeholder="Til dæmis: Takk fyrir erindið"
                    autoFocus
                  />

                  {formErrors.title && (
                    <div className="form-error">
                      {formErrors.title}
                    </div>
                  )}
                </div>

                <div className="form-group">
                  <span className="form-label">
                    Tegund

                    <span className="form-label-description">
                      Veldu hvað atriðið inniheldur
                    </span>
                  </span>

                  <div className="type-selector three-options">
  <button
    type="button"
    className={
      newItemForm.type === "Texti"
        ? "type-option active"
        : "type-option"
    }
    onClick={() => {
      updateNewItemForm("type", "Texti");
    }}
  >
    <span className="type-option-icon">T</span>

    <span className="type-option-content">
      <span className="type-option-title">
        Texti
      </span>

      <span className="type-option-description">
        Svör og sniðmát
      </span>
    </span>
  </button>

  <button
    type="button"
    className={
      newItemForm.type === "Mynd"
        ? "type-option active"
        : "type-option"
    }
    onClick={() => {
      updateNewItemForm("type", "Mynd");
    }}
  >
    <span className="type-option-icon">▣</span>

    <span className="type-option-content">
      <span className="type-option-title">
        Mynd
      </span>

      <span className="type-option-description">
        PNG, JPG eða WebP
      </span>
    </span>
  </button>

  <button
    type="button"
    className={
      newItemForm.type === "Texti + mynd"
        ? "type-option active"
        : "type-option"
    }
    onClick={() => {
      updateNewItemForm(
        "type",
        "Texti + mynd"
      );
    }}
  >
    <span className="type-option-icon">T▣</span>

    <span className="type-option-content">
      <span className="type-option-title">
        Texti + mynd
      </span>

      <span className="type-option-description">
        Afritast saman
      </span>
    </span>
  </button>
</div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label
                      className="form-label"
                      htmlFor="new-category"
                    >
                      Flokkur
                    </label>

                    <select
                      id="new-category"
                      className={
                        formErrors.category
                          ? "form-select error"
                          : "form-select"
                      }
                      value={newItemForm.category}
                      onChange={(event) => {
                        updateNewItemForm(
                          "category",
                          event.target.value
                        );
                      }}
                    >
                      {categories
                        .filter((category) => {
                          return (
                            category.id !== "all" &&
                            category.id !== "favorites"
                          );
                        })
                        .map((category) => (
                          <option
                            key={category.id}
                            value={category.id}
                          >
                            {category.icon} {category.name}
                          </option>
                        ))}
                    </select>

                    {formErrors.category && (
                      <div className="form-error">
                        {formErrors.category}
                      </div>
                    )}
                  </div>

                  <div className="form-group">
                    <label
                      className="form-label"
                      htmlFor="new-tags"
                    >
                      Tögg

                      <span className="form-label-description">
                        Aðskildu tögg með kommu
                      </span>
                    </label>

                    <input
                      id="new-tags"
                      type="text"
                      className="form-input"
                      value={newItemForm.tagsText}
                      onChange={(event) => {
                        updateNewItemForm(
                          "tagsText",
                          event.target.value
                        );
                      }}
                      placeholder="ugla, nemendur, leiðbeiningar"
                    />
                  </div>
                </div>

                {newItemForm.type !== "Mynd" && (
                  <div className="form-group">
                    <label
                      className="form-label"
                      htmlFor="new-content"
                    >
                      Innihald

                      <span className="form-label-description">
                        Textinn sem QuickClip á að afrita
                      </span>
                    </label>

                    <textarea
                      id="new-content"
                      className={
                        formErrors.content
                          ? "form-textarea error"
                          : "form-textarea"
                      }
                      value={newItemForm.content}
                      onChange={(event) => {
                        updateNewItemForm(
                          "content",
                          event.target.value
                        );
                      }}
                      placeholder="Skrifaðu eða límdu textann hér..."
                    />

                    {formErrors.content && (
                      <div className="form-error">
                        {formErrors.content}
                      </div>
                    )}
                  </div>
                )}

{newItemForm.type !== "Texti" && (
  <div className="form-group">
    <span className="form-label">
      Mynd

      <span className="form-label-description">
        Límdu mynd með Ctrl + V, dragðu hana
        hingað eða veldu skrá
      </span>
    </span>

    {newItemForm.imagePreview ? (
      <div className="image-form-preview">
        <img
          src={newItemForm.imagePreview}
          alt="Forskoðun"
        />

        <button
          type="button"
          className="remove-image-button"
          onClick={removeFormImage}
        >
          × Fjarlægja mynd
        </button>
      </div>
    ) : (
      <label
        className="image-drop-area"
        tabIndex={0}
        onPaste={handleImagePaste}
        onDragOver={(event) => {
          event.preventDefault();
        }}
        onDrop={(event) => {
          event.preventDefault();

          const file =
            event.dataTransfer.files[0];

          handleImageFile(file);
        }}
      >
        <input
          type="file"
          accept="image/png,image/jpeg,image/webp"
          hidden
          onChange={(event) => {
            const file = event.target.files[0];
            handleImageFile(file);
            event.target.value = "";
          }}
        />

        <div className="image-drop-icon">
          ▣
        </div>

        <strong>
          Smelltu, límdu eða dragðu mynd
        </strong>

        <span>
          PNG, JPG eða WebP
        </span>
      </label>
    )}
  </div>
)}

                <div
                  className="favorite-option"
                  role="button"
                  tabIndex={0}
                  onClick={() => {
                    updateNewItemForm(
                      "favorite",
                      !newItemForm.favorite
                    );
                  }}
                  onKeyDown={(event) => {
                    if (
                      event.key === "Enter" ||
                      event.key === " "
                    ) {
                      event.preventDefault();

                      updateNewItemForm(
                        "favorite",
                        !newItemForm.favorite
                      );
                    }
                  }}
                >
                  <div className="favorite-option-left">
                    <span className="favorite-option-star">
                      ★
                    </span>

                    <span className="favorite-option-text">
                      <strong>Bæta í uppáhald</strong>

                      <span>
                        Atriðið birtist undir Uppáhald
                      </span>
                    </span>
                  </div>

                  <div
                    className={
                      newItemForm.favorite
                        ? "modal-switch active"
                        : "modal-switch"
                    }
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="modal-cancel-button"
                  onClick={closeNewItemModal}
                >
                  Hætta við
                </button>

                <button
                  type="submit"
                  className="modal-save-button"
                >
                  <span>✓</span>

                  {editingId !== null
                    ? "Vista breytingar"
                    : "Vista atriði"}
                </button>
              </div>
            </form>
          </div>
        )}

{newCategoryForm && (
  <div
    className="modal-overlay"
    onMouseDown={(event) => {
      if (event.target === event.currentTarget) {
        setNewCategoryForm(null);
      }
    }}
  >
    <div className="confirm-dialog">
      <h2>Nýr flokkur</h2>

      <label className="form-label">
        Heiti flokks
      </label>

      <input
        type="text"
        className="form-input"
        value={newCategoryForm.name}
        onChange={(event) => {
          setNewCategoryForm((current) => ({
            ...current,
            name: event.target.value,
          }));
        }}
        autoFocus
      />

      <label className="form-label">
        Veldu íkon
      </label>

      <div className="category-icon-picker">
        {categoryIcons.map((icon) => (
          <button
            key={icon.id}
            type="button"
            className={`category-icon-option ${
              newCategoryForm.iconFile === icon.file
                ? "selected"
                : ""
            }`}
            title={icon.name}
            onClick={() => {
              setNewCategoryForm((current) => ({
                ...current,
                iconFile: icon.file,
              }));
            }}
          >
            <img
              src={`${import.meta.env.BASE_URL}icons/categories/${icon.file}`}
              alt={icon.name}
            />
          </button>
        ))}
      </div>

      <div className="confirm-actions">
        <button
          type="button"
          className="modal-cancel-button"
          onClick={() => {
            setNewCategoryForm(null);
          }}
        >
          Hætta við
        </button>

        <button
          type="button"
          className="modal-save-button"
          disabled={!newCategoryForm.name.trim()}
          onClick={() => {
            const newCategory = {
              id: crypto.randomUUID(),
              name: newCategoryForm.name.trim(),
              icon: "📁",
              iconFile: newCategoryForm.iconFile || undefined,
            };

            setCategories((current) => [
              ...current,
              newCategory,
            ]);

            setActiveCategory(newCategory.id);
            setNewCategoryForm(null);
          }}
        >
          ✓ Vista flokk
        </button>
      </div>
    </div>
  </div>
)}

{editingCategory && (
  <div
    className="modal-overlay"
    onMouseDown={(event) => {
      if (event.target === event.currentTarget) {
        setEditingCategory(null);
      }
    }}
  >
    <div className="confirm-dialog">
      <div className="confirm-icon">
        {editingCategory.icon}
      </div>

      <h2>Breyta flokki</h2>

      <label className="form-label">
        Heiti flokks
      </label>

      <input
        type="text"
        className="form-input"
        value={editingCategory.name}
        onChange={(event) => {
          setEditingCategory((current) => ({
            ...current,
            name: event.target.value,
          }));
        }}
        autoFocus
      />

<label className="form-label">
  Veldu íkon
</label>

<div className="category-icon-picker">
  {categoryIcons.map((icon) => (
    <button
      key={icon.id}
      type="button"
      className={`category-icon-option ${
        editingCategory.iconFile === icon.file ? "selected" : ""
      }`}
      title={icon.name}
      onClick={() => {
        setEditingCategory((current) => ({
          ...current,
          iconFile: icon.file,
        }));
      }}
    >
      <img
        src={`${import.meta.env.BASE_URL}icons/categories/${icon.file}`}
        alt={icon.name}
      />
    </button>
  ))}
</div>

      <div className="confirm-actions">
        <button
          type="button"
          className="modal-cancel-button"
          onClick={() => {
            setEditingCategory(null);
          }}
        >
          Hætta við
        </button>

        <button
          type="button"
          className="modal-save-button"
          onClick={() => {
            if (!editingCategory.name.trim()) {
              return;
            }

            setCategories((current) =>
              current.map((category) =>
                category.id === editingCategory.id
                ? {
                  ...category,
                  name: editingCategory.name.trim(),
                  icon: editingCategory.icon || "📁",
                  iconFile: editingCategory.iconFile || undefined,
                }
              : category
              )
            );

            setEditingCategory(null);
          }}
        >
          ✓ Vista breytingar
        </button>
      </div>
    </div>
  </div>
)}

{deletingCategory && (
  <div
    className="modal-overlay"
    onMouseDown={(event) => {
      if (event.target === event.currentTarget) {
        setDeletingCategory(null);
      }
    }}
  >
    <div className="confirm-dialog">
      <div className="confirm-icon">🗑</div>

      <h2>Eyða flokki?</h2>

      {items.some(
        (item) => item.category === deletingCategory.id
      ) ? (
        <>
          <p>
            Flokkurinn
            <strong> „{deletingCategory.name}“</strong>{" "}
            inniheldur atriði.
          </p>

          <p className="confirm-warning">
            Þú þarft fyrst að velja hvert á að færa
            atriðin áður en flokknum er eytt.
          </p>
          <label className="form-label">
  Færa atriðin í
</label>

<select
  className="form-input"
  value={moveToCategoryId}
  onChange={(event) => {
    setMoveToCategoryId(event.target.value);
  }}
>
  <option value="">Veldu flokk...</option>

  {categories
    .filter(
      (category) =>
        category.id !== "all" &&
        category.id !== "favorites" &&
        category.id !== deletingCategory.id
    )
    .map((category) => (
      <option
        key={category.id}
        value={category.id}
      >
        {category.icon} {category.name}
      </option>
    ))}
</select>
<div className="confirm-actions">
  <button
    type="button"
    className="modal-cancel-button"
    onClick={() => {
      setDeletingCategory(null);
      setMoveToCategoryId("");
    }}
  >
    Hætta við
  </button>

  <button
    type="button"
    className="confirm-delete-button"
    disabled={!moveToCategoryId}
    onClick={() => {
      if (!moveToCategoryId) {
        return;
      }

      setItems((current) =>
        current.map((item) =>
          item.category === deletingCategory.id
            ? {
                ...item,
                category: moveToCategoryId,
              }
            : item
        )
      );

      setCategories((current) =>
        current.filter(
          (category) =>
            category.id !== deletingCategory.id
        )
      );

      if (activeCategory === deletingCategory.id) {
        setActiveCategory(moveToCategoryId);
      }

      setDeletingCategory(null);
      setMoveToCategoryId("");
    }}
  >
    Færa atriði og eyða flokki
  </button>
</div>
        </>
      ) : (
        <>
          <p>
            Ertu viss um að þú viljir eyða flokknum
            <strong> „{deletingCategory.name}“</strong>?
          </p>

          <p className="confirm-warning">
            Ekki er hægt að afturkalla þessa aðgerð.
          </p>

          <div className="confirm-actions">
            <button
              type="button"
              className="modal-cancel-button"
              onClick={() => {
                setDeletingCategory(null);
              }}
            >
              Hætta við
            </button>

            <button
              type="button"
              className="confirm-delete-button"
              onClick={() => {
                setCategories((current) =>
                  current.filter(
                    (category) =>
                      category.id !== deletingCategory.id
                  )
                );

                if (
                  activeCategory === deletingCategory.id
                ) {
                  setActiveCategory("all");
                }

                setDeletingCategory(null);
              }}
            >
              🗑 Eyða flokki
            </button>
          </div>
        </>
      )}
    </div>
  </div>
)}

        {deleteTarget && (
          <div
            className="modal-overlay"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) {
                setDeleteTarget(null);
              }
            }}
          >
            <div className="confirm-dialog">
              <div className="confirm-icon">🗑</div>

              <h2>Eyða atriði?</h2>

              <p>
                Ertu viss um að þú viljir eyða
                <strong> „{deleteTarget.title}“</strong>?
              </p>

              <p className="confirm-warning">
                Ekki er hægt að afturkalla þessa aðgerð.
              </p>

              <div className="confirm-actions">
                <button
                  type="button"
                  className="modal-cancel-button"
                  onClick={() => {
                    setDeleteTarget(null);
                  }}
                >
                  Hætta við
                </button>

                <button
                  type="button"
                  className="confirm-delete-button"
                  onClick={() => {
                    deleteItem(deleteTarget.id);
                  }}
                >
                  🗑 Eyða atriði
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  export default App;