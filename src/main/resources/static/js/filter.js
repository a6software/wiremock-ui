document.addEventListener("DOMContentLoaded", () => {
  const searchInput = document.getElementById("mapping-search");
  const advancedFilters = document.getElementById("advanced-filters");
  const methodFilters = document.getElementById("method-filters");
  const matcherFilters = document.getElementById("matcher-filters");
  const statusFilters = document.getElementById("status-filters");
  const refreshLink = document.getElementById("refresh-link");
  const tableBody = document.querySelector(".route-table tbody");
  const rows = Array.from(document.querySelectorAll(".route-row"));
  const sortButtons = Array.from(document.querySelectorAll(".sort-button"));
  const expandAllButton = document.getElementById("expand-all-button");
  const visibleCount = document.getElementById("visible-count");
  const emptyState = document.getElementById("client-empty-state");
  const url = new URL(window.location.href);
  let activeSort = { key: null, direction: null };

  if (!searchInput || !advancedFilters || !methodFilters || !matcherFilters || !statusFilters || !tableBody || rows.length === 0 || !visibleCount || !emptyState) {
    return;
  }

  const uniqueValues = (key) => [...new Set(rows.map((row) => row.dataset[key] ?? ""))].filter(Boolean);

  const renderCheckboxes = (container, paramName, values) => {
    container.innerHTML = "";
    values.forEach((value) => {
      const id = `${paramName}-${value}`.replace(/[^a-zA-Z0-9_-]/g, "-");
      const label = document.createElement("label");
      label.className = "checkbox-chip";
      label.innerHTML = `<input type="checkbox" value="${value}" data-param="${paramName}" id="${id}"><span>${value}</span>`;
      container.appendChild(label);
    });
  };

  renderCheckboxes(methodFilters, "method", uniqueValues("method"));
  renderCheckboxes(matcherFilters, "matcher", uniqueValues("matcher"));
  renderCheckboxes(statusFilters, "status", uniqueValues("status"));

  const checkboxFilters = Array.from(document.querySelectorAll('.checkbox-group input[type="checkbox"]'));

  const selectedValues = (paramName) =>
    checkboxFilters
      .filter((checkbox) => checkbox.dataset.param === paramName && checkbox.checked)
      .map((checkbox) => checkbox.value);

  const sortValueFor = (row, key) => {
    if (key === "contentType") return row.dataset.contentType ?? "";
    if (key === "index" || key === null) return Number(row.dataset.index ?? "0");
    if (key === "status") return Number(row.dataset.status ?? "0");
    return row.dataset[key] ?? "";
  };

  const renderSortState = () => {
    sortButtons.forEach((button) => {
      const isActive = button.dataset.sortKey === activeSort.key;
      button.classList.toggle("active", isActive);
      button.dataset.sortDirection = isActive ? (activeSort.direction === "asc" ? "↑" : "↓") : " ";
    });
  };

  const detailRowFor = (row) => row.nextElementSibling;

  const syncUrlState = () => {
    const search = searchInput.value.trim();
    const methodValues = selectedValues("method");
    const matcherValues = selectedValues("matcher");
    const statusValues = selectedValues("status");

    if (search) {
      url.searchParams.set("search", search);
    } else {
      url.searchParams.delete("search");
    }

    url.searchParams.delete("method");
    methodValues.forEach((value) => url.searchParams.append("method", value));

    url.searchParams.delete("matcher");
    matcherValues.forEach((value) => url.searchParams.append("matcher", value));

    url.searchParams.delete("status");
    statusValues.forEach((value) => url.searchParams.append("status", value));

    if (advancedFilters.open) {
      url.searchParams.set("filters", "open");
    } else {
      url.searchParams.delete("filters");
    }

    const currentUrl = `${url.pathname}${url.search}`;
    window.history.replaceState({}, "", currentUrl);
    if (refreshLink) {
      refreshLink.setAttribute("href", currentUrl || "/");
    }
  };

  const setExpanded = (row, expanded) => {
    const detailRow = detailRowFor(row);
    const toggle = row.querySelector(".expand-toggle");
    if (!detailRow || !toggle) return;

    toggle.setAttribute("aria-expanded", String(expanded));
    detailRow.classList.toggle("hidden", !expanded || row.classList.contains("hidden"));
  };

  const syncExpandAllButton = () => {
    if (!expandAllButton) return;

    const visibleRows = rows.filter((row) => !row.classList.contains("hidden"));
    const allExpanded = visibleRows.length > 0 && visibleRows.every((row) => row.querySelector(".expand-toggle")?.getAttribute("aria-expanded") === "true");
    expandAllButton.setAttribute("aria-expanded", String(allExpanded));
    expandAllButton.setAttribute("aria-label", allExpanded ? "Collapse all rows" : "Expand all rows");
  };

  const applySort = () => {
    const sorted = [...rows].sort((left, right) => {
      if (!activeSort.key || !activeSort.direction) {
        return Number(left.dataset.index ?? "0") - Number(right.dataset.index ?? "0");
      }

      const leftValue = sortValueFor(left, activeSort.key);
      const rightValue = sortValueFor(right, activeSort.key);

      if (leftValue < rightValue) return activeSort.direction === "asc" ? -1 : 1;
      if (leftValue > rightValue) return activeSort.direction === "asc" ? 1 : -1;

      return Number(left.dataset.index ?? "0") - Number(right.dataset.index ?? "0");
    });

    sorted.forEach((row) => {
      tableBody.appendChild(row);
      const detailRow = detailRowFor(row);
      if (detailRow) tableBody.appendChild(detailRow);
    });
    renderSortState();
    syncExpandAllButton();
  };

  const applyFilters = () => {
    const query = searchInput.value.trim().toLowerCase();
    const methods = selectedValues("method");
    const matchers = selectedValues("matcher");
    const statuses = selectedValues("status");
    let visible = 0;

    rows.forEach((row) => {
      const routeText = (row.dataset.route ?? "").toLowerCase();
      const rowMethod = row.dataset.method ?? "";
      const rowMatcher = row.dataset.matcher ?? "";
      const rowStatus = row.dataset.status ?? "";
      const matchesQuery = query === "" || routeText.includes(query);
      const matchesMethod = methods.length === 0 || methods.includes(rowMethod);
      const matchesMatcher = matchers.length === 0 || matchers.includes(rowMatcher);
      const matchesStatus = statuses.length === 0 || statuses.includes(rowStatus);
      const isVisible = matchesQuery && matchesMethod && matchesMatcher && matchesStatus;

      row.classList.toggle("hidden", !isVisible);
      const detailRow = detailRowFor(row);
      if (detailRow) {
        const expanded = row.querySelector(".expand-toggle")?.getAttribute("aria-expanded") === "true";
        detailRow.classList.toggle("hidden", !isVisible || !expanded);
      }
      if (isVisible) {
        visible += 1;
      }
    });

    visibleCount.textContent = String(visible);
    emptyState.classList.toggle("hidden", visible !== 0);
    syncExpandAllButton();
    syncUrlState();
  };

  searchInput.addEventListener("input", applyFilters);
  checkboxFilters.forEach((checkbox) => checkbox.addEventListener("change", applyFilters));
  advancedFilters.addEventListener("toggle", syncUrlState);
  sortButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const key = button.dataset.sortKey;
      if (!key) return;

      if (activeSort.key !== key) {
        activeSort = { key, direction: "asc" };
      } else if (activeSort.direction === "asc") {
        activeSort.direction = activeSort.direction === "asc" ? "desc" : "asc";
      } else if (activeSort.direction === "desc") {
        activeSort = { key: null, direction: null };
      } else {
        activeSort = { key, direction: "asc" };
      }

      applySort();
      applyFilters();
    });
  });

  rows.forEach((row) => {
    row.querySelector(".expand-toggle")?.addEventListener("click", () => {
      const expanded = row.querySelector(".expand-toggle")?.getAttribute("aria-expanded") === "true";
      setExpanded(row, !expanded);
      syncExpandAllButton();
    });
  });

  expandAllButton?.addEventListener("click", () => {
    const visibleRows = rows.filter((row) => !row.classList.contains("hidden"));
    const allExpanded = visibleRows.length > 0 && visibleRows.every((row) => row.querySelector(".expand-toggle")?.getAttribute("aria-expanded") === "true");
    visibleRows.forEach((row) => setExpanded(row, !allExpanded));
    syncExpandAllButton();
  });

  tableBody.addEventListener("click", async (event) => {
    const button = event.target instanceof Element ? event.target.closest(".copy-route-button") : null;
    if (!button) return;

    const route = button.getAttribute("data-route");
    if (!route) return;

    try {
      await navigator.clipboard.writeText(route);
      button.classList.add("copied");
      window.setTimeout(() => button.classList.remove("copied"), 900);
    } catch {
      // Ignore clipboard failures in unsupported environments.
    }
  });

  const initialSearch = url.searchParams.get("search");
  const initialMethods = url.searchParams.getAll("method");
  const initialMatchers = url.searchParams.getAll("matcher");
  const initialStatuses = url.searchParams.getAll("status");
  if (initialSearch) {
    searchInput.value = initialSearch;
  }
  checkboxFilters.forEach((checkbox) => {
    const param = checkbox.dataset.param;
    if (param === "method" && initialMethods.includes(checkbox.value)) checkbox.checked = true;
    if (param === "matcher" && initialMatchers.includes(checkbox.value)) checkbox.checked = true;
    if (param === "status" && initialStatuses.includes(checkbox.value)) checkbox.checked = true;
  });
  if (url.searchParams.get("filters") === "open") {
    advancedFilters.open = true;
  }
  applyFilters();
});
