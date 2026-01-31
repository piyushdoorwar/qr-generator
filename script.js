const qrSize = 260;

const elements = {
  toastContainer: document.getElementById("toast-container"),
  qrContainer: document.getElementById("qr-preview"),
  qrFrame: document.getElementById("qr-frame"),
  frameLabel: document.getElementById("frameLabel"),
  emptyState: document.getElementById("qr-empty"),
  statusPill: document.getElementById("qr-status"),
  meta: document.getElementById("qr-meta"),
  copyBtn: document.getElementById("copyBtn"),
  downloadBtn: document.getElementById("downloadBtn"),
  settingsBtn: document.getElementById("settingsBtn"),
  designModal: document.getElementById("designModal"),
  designModalClose: document.getElementById("designModalClose"),
  infoBtn: document.getElementById("infoBtn"),
  tipsModal: document.getElementById("tipsModal"),
  tipsModalClose: document.getElementById("tipsModalClose"),
  frameText: document.getElementById("frameText"),
  frameColor: document.getElementById("frameColor"),
  frameColorText: document.getElementById("frameColorText"),
  dotColor: document.getElementById("dotColor"),
  dotColorText: document.getElementById("dotColorText"),
  bgColor: document.getElementById("bgColor"),
  bgColorText: document.getElementById("bgColorText"),
  textMessage: document.getElementById("textMessage"),
  websiteUrl: document.getElementById("websiteUrl"),
  emailAddress: document.getElementById("emailAddress"),
  phoneCode: document.getElementById("phoneCode"),
  phoneNumber: document.getElementById("phoneNumber"),
  waCode: document.getElementById("waCode"),
  waNumber: document.getElementById("waNumber")
};

const defaultState = {
  contentType: "text",
  frame: "soft",
  shape: "rounded",
  level: "Q",
  dotColor: "#1f1530",
  bgColor: "#ffffff",
  frameColor: "#ffffff",
  frameText: "Scan me",
  logo: null
};

const state = { ...defaultState };

const logoSvgs = {
  phone: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
    <rect width="100" height="100" rx="20" fill="#3b2dd7" />
    <rect x="32" y="18" width="36" height="64" rx="8" fill="#ffffff" />
    <circle cx="50" cy="74" r="4" fill="#3b2dd7" />
  </svg>`,
  email: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
    <rect width="100" height="100" rx="20" fill="#f59e0b" />
    <rect x="18" y="28" width="64" height="44" rx="6" fill="#ffffff" />
    <path d="M22 32l28 22 28-22" fill="none" stroke="#f59e0b" stroke-width="6" />
  </svg>`,
  link: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
    <rect width="100" height="100" rx="20" fill="#0f9f73" />
    <path d="M38 58l24-24" stroke="#ffffff" stroke-width="10" stroke-linecap="round" />
    <path d="M30 42a12 12 0 010-17l7-7a12 12 0 0117 0" fill="none" stroke="#ffffff" stroke-width="8" stroke-linecap="round" />
    <path d="M70 58a12 12 0 010 17l-7 7a12 12 0 01-17 0" fill="none" stroke="#ffffff" stroke-width="8" stroke-linecap="round" />
  </svg>`,
  whatsapp: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
    <rect width="100" height="100" rx="20" fill="#25d366" />
    <path d="M50 22c-14 0-26 11-26 25 0 5 1 10 4 14l-5 17 18-5c3 1 6 2 9 2 14 0 26-11 26-25S64 22 50 22z" fill="#ffffff" />
    <path d="M42 40c1-1 2-1 3 0l4 4c1 1 1 2 0 3l-2 2c2 4 5 7 9 9l2-2c1-1 2-1 3 0l4 4c1 1 1 2 0 3l-3 3c-2 2-5 3-8 2-8-2-15-9-17-17-1-3 0-6 2-8l3-3z" fill="#25d366" />
  </svg>`
};

const framePresets = {
  none: { pad: 0, radius: 0, stroke: "none", strokeWidth: 0, label: false },
  soft: { pad: 18, radius: 22, stroke: "#e7e2f2", strokeWidth: 1, label: false },
  badge: { pad: 18, radius: 22, stroke: "#e7e2f2", strokeWidth: 1, label: true, labelHeight: 36, labelGap: 10, labelRadius: 999 },
  ticket: { pad: 20, radius: 20, stroke: "#dcd6eb", strokeWidth: 2, label: true, labelHeight: 40, labelGap: 12, labelRadius: 12, dash: "6 6" }
};

const shapeMap = {
  rounded: { dots: "rounded", cornersSquare: "extra-rounded", cornersDot: "dot" },
  square: { dots: "square", cornersSquare: "square", cornersDot: "square" },
  dots: { dots: "dots", cornersSquare: "dot", cornersDot: "dot" },
  classy: { dots: "classy", cornersSquare: "extra-rounded", cornersDot: "dot" },
  "classy-rounded": { dots: "classy-rounded", cornersSquare: "extra-rounded", cornersDot: "dot" },
  "extra-rounded": { dots: "extra-rounded", cornersSquare: "extra-rounded", cornersDot: "dot" }
};

let qrCode;

function svgToDataUri(svg) {
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

const logoLibrary = Object.fromEntries(
  Object.entries(logoSvgs).map(([key, svg]) => [key, svgToDataUri(svg)])
);

function showToast(message, type = "success") {
  if (!elements.toastContainer) return;
  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.textContent = message;
  elements.toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 3000);
}

function setStatus(message, tone) {
  elements.statusPill.textContent = message;
  elements.statusPill.classList.toggle("is-warning", tone === "warning");
}

function setActionsEnabled(enabled) {
  elements.copyBtn.disabled = !enabled;
  elements.downloadBtn.disabled = !enabled;
}

function setActive(elementsList, activeEl) {
  elementsList.forEach((el) => el.classList.remove("active"));
  if (activeEl) activeEl.classList.add("active");
}

function updateContentForm() {
  document.querySelectorAll("[data-content-form]").forEach((form) => {
    const isActive = form.dataset.contentForm === state.contentType;
    form.hidden = !isActive;
    form.classList.toggle("is-active", isActive);
    form.setAttribute("aria-hidden", isActive ? "false" : "true");
  });
}

function updateDesignTabs(tab) {
  document.querySelectorAll("[data-design-tab]").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.designTab === tab);
  });
  document.querySelectorAll("[data-design-panel]").forEach((panel) => {
    panel.classList.toggle("active", panel.dataset.designPanel === tab);
  });
}

function openDesignModal() {
  if (!elements.designModal) return;
  elements.designModal.classList.add("is-open");
  elements.designModal.setAttribute("aria-hidden", "false");
}

function closeDesignModal() {
  if (!elements.designModal) return;
  elements.designModal.classList.remove("is-open");
  elements.designModal.setAttribute("aria-hidden", "true");
}

function openTipsModal() {
  if (!elements.tipsModal) return;
  elements.tipsModal.classList.add("is-open");
  elements.tipsModal.setAttribute("aria-hidden", "false");
}

function closeTipsModal() {
  if (!elements.tipsModal) return;
  elements.tipsModal.classList.remove("is-open");
  elements.tipsModal.setAttribute("aria-hidden", "true");
}

function normalizeHex(value) {
  if (!value) return null;
  const trimmed = value.trim();
  const raw = trimmed.startsWith("#") ? trimmed.slice(1) : trimmed;
  if (!/^[0-9a-fA-F]{3}([0-9a-fA-F]{3})?$/.test(raw)) return null;
  const full = raw.length === 3 ? raw.split("").map((ch) => ch + ch).join("") : raw;
  return `#${full.toLowerCase()}`;
}

function bindColorPair(colorInput, textInput, callback) {
  const applyColor = (value) => {
    const hex = normalizeHex(value);
    if (!hex) return;
    colorInput.value = hex;
    textInput.value = hex;
    callback(hex);
  };

  colorInput.addEventListener("input", (event) => {
    applyColor(event.target.value);
  });

  textInput.addEventListener("input", (event) => {
    const hex = normalizeHex(event.target.value);
    if (!hex) return;
    colorInput.value = hex;
    textInput.value = hex;
    callback(hex);
  });

  textInput.addEventListener("blur", () => {
    textInput.value = colorInput.value;
  });
}

function normalizeUrl(value) {
  if (!value) return "";
  let trimmed = value.trim();
  if (!/^https?:\/\//i.test(trimmed)) {
    trimmed = `https://${trimmed}`;
  }
  try {
    return new URL(trimmed).toString();
  } catch {
    return "";
  }
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function normalizePhone(code, number) {
  const combined = `${code || ""}${number || ""}`;
  const digits = combined.replace(/\D/g, "");
  return digits;
}

function buildQrData() {
  switch (state.contentType) {
    case "text":
      return elements.textMessage.value.trim();
    case "website": {
      const url = normalizeUrl(elements.websiteUrl.value);
      if (!url) return "";
      return url;
    }
    case "email": {
      const address = elements.emailAddress.value.trim();
      if (!isValidEmail(address)) return "";
      return `mailto:${address}`;
    }
    case "phone": {
      const digits = normalizePhone(elements.phoneCode.value, elements.phoneNumber.value);
      if (!digits) return "";
      return `tel:+${digits}`;
    }
    case "whatsapp": {
      const digits = normalizePhone(elements.waCode.value, elements.waNumber.value);
      if (!digits) return "";
      return `https://wa.me/${digits}`;
    }
    default:
      return "";
  }
}

function getContrastColor(hex) {
  const normalized = normalizeHex(hex) || "#000000";
  const color = normalized.slice(1);
  const r = parseInt(color.slice(0, 2), 16) / 255;
  const g = parseInt(color.slice(2, 4), 16) / 255;
  const b = parseInt(color.slice(4, 6), 16) / 255;
  const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return luminance > 0.6 ? "#1b1233" : "#ffffff";
}

function updateFramePreview() {
  elements.qrFrame.className = `qr-frame frame-${state.frame}`;
  elements.qrFrame.style.setProperty("--frame-bg", state.frameColor);
  elements.qrFrame.style.setProperty("--frame-accent", state.dotColor);
  const showLabel = state.frame === "badge" || state.frame === "ticket";
  elements.frameLabel.style.display = showLabel ? "inline-flex" : "none";
  elements.frameLabel.textContent = state.frameText || defaultState.frameText;
  elements.frameLabel.style.color = getContrastColor(state.dotColor);
}

function updateMeta(data) {
  const labels = {
    text: "Text",
    website: "Website",
    email: "Email",
    phone: "Mobile",
    whatsapp: "WhatsApp"
  };
  const label = labels[state.contentType] || "QR";
  elements.meta.textContent = `${qrSize} x ${qrSize} - SVG - ${label}`;
  setStatus(data ? "Ready" : "Missing", data ? "ready" : "warning");
}

function updateQrCode() {
  const data = buildQrData();
  updateMeta(data);

  if (!data) {
    elements.emptyState.hidden = false;
    setActionsEnabled(false);
    return;
  }

  elements.emptyState.hidden = true;
  setActionsEnabled(true);

  const shape = shapeMap[state.shape] || shapeMap.rounded;

  qrCode.update({
    data,
    dotsOptions: { color: state.dotColor, type: shape.dots },
    cornersSquareOptions: { color: state.dotColor, type: shape.cornersSquare },
    cornersDotOptions: { color: state.dotColor, type: shape.cornersDot },
    backgroundOptions: { color: state.bgColor },
    image: state.logo,
    qrOptions: { errorCorrectionLevel: state.level }
  });
}

function escapeXml(value) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

async function buildExportSvg() {
  if (!qrCode) return null;
  const data = buildQrData();
  if (!data) return null;
  const raw = await qrCode.getRawData("svg");
  if (!raw) return null;
  const rawSvg = await raw.text();
  return applyFrameToSvg(rawSvg);
}

function applyFrameToSvg(rawSvg) {
  const preset = framePresets[state.frame] || framePresets.none;
  if (preset === framePresets.none) {
    return rawSvg;
  }

  const parser = new DOMParser();
  const doc = parser.parseFromString(rawSvg, "image/svg+xml");
  const svgEl = doc.documentElement;
  const qrInner = svgEl.innerHTML;

  const pad = preset.pad || 0;
  const labelHeight = preset.label ? preset.labelHeight : 0;
  const labelGap = preset.label ? preset.labelGap : 0;
  const totalWidth = qrSize + pad * 2;
  const totalHeight = qrSize + pad * 2 + labelGap + labelHeight;
  const labelText = preset.label ? (state.frameText || defaultState.frameText) : "";
  const labelWidth = Math.min(totalWidth - pad * 2, qrSize * 0.9);
  const labelX = (totalWidth - labelWidth) / 2;
  const labelY = pad + qrSize + labelGap;
  const labelRadius = preset.labelRadius ?? 999;
  const labelColor = state.dotColor;
  const labelTextColor = getContrastColor(state.dotColor);

  const stroke = preset.stroke !== "none" ? ` stroke=\"${preset.stroke}\" stroke-width=\"${preset.strokeWidth}\"` : "";
  const dash = preset.dash ? ` stroke-dasharray=\"${preset.dash}\"` : "";

  const labelMarkup = preset.label
    ? `\n  <rect x=\"${labelX}\" y=\"${labelY}\" width=\"${labelWidth}\" height=\"${labelHeight}\" rx=\"${labelRadius}\" fill=\"${labelColor}\" />\n  <text x=\"${totalWidth / 2}\" y=\"${labelY + labelHeight / 2}\" text-anchor=\"middle\" dominant-baseline=\"middle\" font-family=\"Plus Jakarta Sans, Arial, sans-serif\" font-size=\"14\" font-weight=\"600\" fill=\"${labelTextColor}\">${escapeXml(labelText)}</text>`
    : "";

  return `<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"${totalWidth}\" height=\"${totalHeight}\" viewBox=\"0 0 ${totalWidth} ${totalHeight}\">\n  <rect x=\"0\" y=\"0\" width=\"${totalWidth}\" height=\"${totalHeight}\" rx=\"${preset.radius}\" fill=\"${state.frameColor}\"${stroke}${dash} />\n  <g transform=\"translate(${pad}, ${pad})\">${qrInner}</g>${labelMarkup}\n</svg>`;
}

async function copySvg() {
  const svgString = await buildExportSvg();
  if (!svgString) {
    showToast("Add content before copying", "error");
    return;
  }

  try {
    if (navigator.clipboard && window.ClipboardItem) {
      const blob = new Blob([svgString], { type: "image/svg+xml" });
      await navigator.clipboard.write([new ClipboardItem({ "image/svg+xml": blob })]);
      showToast("SVG copied to clipboard", "success");
      return;
    }
    await navigator.clipboard.writeText(svgString);
    showToast("SVG code copied", "success");
  } catch {
    showToast("Clipboard copy failed", "error");
  }
}

async function downloadSvg() {
  const svgString = await buildExportSvg();
  if (!svgString) {
    showToast("Add content before downloading", "error");
    return;
  }
  const blob = new Blob([svgString], { type: "image/svg+xml" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "qr-code.svg";
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
  showToast("SVG downloaded", "success");
}

function resetApp() {
  Object.assign(state, defaultState);
  elements.textMessage.value = "";
  elements.websiteUrl.value = "";
  elements.emailAddress.value = "";
  elements.phoneCode.value = "+1";
  elements.phoneNumber.value = "";
  elements.waCode.value = "+91";
  elements.waNumber.value = "";
  elements.frameText.value = defaultState.frameText;
  elements.frameColor.value = defaultState.frameColor;
  elements.frameColorText.value = defaultState.frameColor;
  elements.dotColor.value = defaultState.dotColor;
  elements.dotColorText.value = defaultState.dotColor;
  elements.bgColor.value = defaultState.bgColor;
  elements.bgColorText.value = defaultState.bgColor;
  setActive(document.querySelectorAll("[data-content-type]"), document.querySelector("[data-content-type='text']"));
  updateContentForm();
  setActive(document.querySelectorAll("[data-frame]"), document.querySelector("[data-frame='none']"));
  setActive(document.querySelectorAll("[data-shape]"), document.querySelector("[data-shape='rounded']"));
  setActive(document.querySelectorAll("[data-logo]"), document.querySelector("[data-logo='none']"));
  setActive(document.querySelectorAll("[data-level]"), document.querySelector("[data-level='Q']"));
  updateFramePreview();
  updateQrCode();
}

function bindEvents() {
  document.querySelectorAll("[data-content-type]").forEach((btn) => {
    btn.addEventListener("click", () => {
      state.contentType = btn.dataset.contentType;
      setActive(document.querySelectorAll("[data-content-type]"), btn);
      updateContentForm();
      updateQrCode();
    });
  });

  document.querySelectorAll("[data-design-tab]").forEach((btn) => {
    btn.addEventListener("click", () => {
      updateDesignTabs(btn.dataset.designTab);
    });
  });

  document.querySelectorAll("[data-frame]").forEach((btn) => {
    btn.addEventListener("click", () => {
      state.frame = btn.dataset.frame;
      setActive(document.querySelectorAll("[data-frame]"), btn);
      updateFramePreview();
      updateQrCode();
    });
  });

  document.querySelectorAll("[data-shape]").forEach((btn) => {
    btn.addEventListener("click", () => {
      state.shape = btn.dataset.shape;
      setActive(document.querySelectorAll("[data-shape]"), btn);
      updateQrCode();
    });
  });

  document.querySelectorAll("[data-logo]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const key = btn.dataset.logo;
      state.logo = key === "none" ? null : logoLibrary[key];
      setActive(document.querySelectorAll("[data-logo]"), btn);
      updateQrCode();
    });
  });

  document.querySelectorAll("[data-level]").forEach((btn) => {
    btn.addEventListener("click", () => {
      state.level = btn.dataset.level;
      setActive(document.querySelectorAll("[data-level]"), btn);
      updateQrCode();
    });
  });

  const textInputs = [
    elements.textMessage,
    elements.websiteUrl,
    elements.emailAddress,
    elements.phoneCode,
    elements.phoneNumber,
    elements.waCode,
    elements.waNumber,
    elements.frameText
  ];

  textInputs.forEach((input) => {
    input.addEventListener("input", () => {
      if (input === elements.frameText) {
        state.frameText = elements.frameText.value;
        updateFramePreview();
      }
      updateQrCode();
    });
  });

  bindColorPair(elements.frameColor, elements.frameColorText, (value) => {
    state.frameColor = value;
    updateFramePreview();
  });

  bindColorPair(elements.dotColor, elements.dotColorText, (value) => {
    state.dotColor = value;
    updateFramePreview();
    updateQrCode();
  });

  bindColorPair(elements.bgColor, elements.bgColorText, (value) => {
    state.bgColor = value;
    updateQrCode();
  });

  elements.copyBtn.addEventListener("click", copySvg);
  elements.downloadBtn.addEventListener("click", downloadSvg);

  if (elements.settingsBtn) {
    elements.settingsBtn.addEventListener("click", openDesignModal);
  }

  if (elements.designModalClose) {
    elements.designModalClose.addEventListener("click", closeDesignModal);
  }

  if (elements.designModal) {
    elements.designModal.addEventListener("click", (event) => {
      if (event.target === elements.designModal) {
        closeDesignModal();
      }
    });
  }

  if (elements.infoBtn) {
    elements.infoBtn.addEventListener("click", openTipsModal);
  }

  if (elements.tipsModalClose) {
    elements.tipsModalClose.addEventListener("click", closeTipsModal);
  }

  if (elements.tipsModal) {
    elements.tipsModal.addEventListener("click", (event) => {
      if (event.target === elements.tipsModal) {
        closeTipsModal();
      }
    });
  }

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeDesignModal();
      closeTipsModal();
    }
  });
}

function init() {
  if (!window.QRCodeStyling) {
    showToast("QR library failed to load", "error");
    return;
  }

  qrCode = new QRCodeStyling({
    width: qrSize,
    height: qrSize,
    type: "svg",
    data: " ",
    margin: 0,
    qrOptions: { errorCorrectionLevel: state.level },
    dotsOptions: { color: state.dotColor, type: "rounded" },
    backgroundOptions: { color: state.bgColor },
    cornersSquareOptions: { color: state.dotColor, type: "extra-rounded" },
    cornersDotOptions: { color: state.dotColor, type: "dot" },
    imageOptions: { crossOrigin: "anonymous", margin: 6, imageSize: 0.28 }
  });

  qrCode.append(elements.qrContainer);

  elements.frameText.value = state.frameText;
  elements.frameColor.value = state.frameColor;
  elements.frameColorText.value = state.frameColor;
  elements.dotColor.value = state.dotColor;
  elements.dotColorText.value = state.dotColor;
  elements.bgColor.value = state.bgColor;
  elements.bgColorText.value = state.bgColor;

  updateContentForm();
  updateFramePreview();
  updateQrCode();
  bindEvents();
}

init();
