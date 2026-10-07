(() => {
  const titles = {
    dashboard: "Dashboard",
    trips: "Trips",
    applications: "My Applications",
    gear: "Gear",
    grant: "Grant",
    membership: "Membership",
    support: "Support MCA",
    profile: "Profile",
    leader: "Manage Trips",
    admin: "Admin"
  };

  const tripData = {
    "joshua-tree": {
      title: "Joshua Tree",
      type: "Rock climbing",
      meta: "October 12–13, 2026",
      date: "Oct. 12–13",
      leaders: "Charlie · Sienna",
      difficulty: "Intermediate",
      capacity: "12 participants",
      applicationStatus: "Closed",
      applicationClass: "status-closed",
      applicationCopy: "Your application was accepted. This trip is now closed to new applications.",
      applyLabel: "Application accepted",
      roster: [
        ["Tony Fisher","Distinguished Member"],
        ["Charlie","Trip Leader"],
        ["Sienna","Trip Leader"],
        ["Member A","Member"],
        ["Member B","Member"],
        ["Member C","Member"]
      ],
      gear: [
        ["Mammut 70m Rope #02","Tony Fisher"],
        ["Black Diamond Helmet #07","Tony Fisher"],
        ["Crash Pad #01","Member B"]
      ]
    },
    "four-peaks": {
      title: "Four Peaks Traverse",
      type: "Mountaineering / hiking",
      meta: "October 31, 2026",
      date: "Oct. 31",
      leaders: "To be assigned",
      difficulty: "Strenuous",
      capacity: "Participant limit set by trip leaders",
      applicationStatus: "Applications open",
      applicationClass: "status-open",
      applicationCopy: "Every participant applies. The trip leader reviews applications and the President participates in the final decision.",
      applyLabel: "Start application",
      roster: [["Trip leader","To be assigned"]],
      gear: [["No gear assigned yet","—"]]
    },
    "cactus-to-clouds": {
      title: "Cactus to Clouds",
      type: "Endurance objective",
      meta: "November 7–8, 2026",
      date: "Nov. 7–8",
      leaders: "To be assigned",
      difficulty: "Very strenuous",
      capacity: "Participant limit set by trip leaders",
      applicationStatus: "Applications open",
      applicationClass: "status-open",
      applicationCopy: "Every participant applies. Leaders can use trip-specific questions to assess preparation and fit.",
      applyLabel: "Start application",
      roster: [["Trip leader","To be assigned"]],
      gear: [["No gear assigned yet","—"]]
    },
    "sierras": {
      title: "Spring Sierra Week",
      type: "Ice · ski mountaineering · technical climbing",
      meta: "Spring Break 2027",
      date: "Spring Break",
      leaders: "To be assigned",
      difficulty: "Variable by objective",
      capacity: "Objective-dependent",
      applicationStatus: "Applications open",
      applicationClass: "status-open",
      applicationCopy: "Your prototype application is marked under review. Final participant decisions are made by the trip leader and President.",
      applyLabel: "Application under review",
      roster: [["Trip leader","To be assigned"]],
      gear: [["Gear plan","To be assigned by objective"]]
    }
  };

  const allNavButtons = () => [...document.querySelectorAll("[data-view]")];

  function showView(view, updateHash = true) {
    if (!titles[view]) view = "dashboard";

    document.querySelectorAll("[data-view-panel]").forEach(panel => {
      panel.classList.toggle("active", panel.dataset.viewPanel === view);
    });

    document.querySelectorAll(".portal-nav-link[data-view]").forEach(button => {
      button.classList.toggle("active", button.dataset.view === view);
    });

    const title = document.querySelector("[data-view-title]");
    if (title) title.textContent = titles[view];

    if (updateHash) history.replaceState(null, "", "#" + view);
    window.scrollTo({ top: 0, behavior: "instant" });
    document.body.classList.remove("menu-open");

    if (view !== "trips") closeTripDetail();
  }

  function openTripDetail(slug) {
    const trip = tripData[slug];
    if (!trip) return;

    showView("trips");
    const detail = document.querySelector("[data-trip-detail]");
    if (!detail) return;

    const table = document.querySelector('[data-view-panel="trips"] .table-card');
    const toolbar = document.querySelector('[data-view-panel="trips"] .toolbar');
    if (table) table.hidden = true;
    if (toolbar) toolbar.hidden = true;
    detail.hidden = false;

    detail.querySelector("[data-trip-type]").textContent = trip.type;
    detail.querySelector("[data-trip-title]").textContent = trip.title;
    detail.querySelector("[data-trip-meta]").textContent = trip.meta;
    detail.querySelector("[data-trip-date]").textContent = trip.date;
    detail.querySelector("[data-trip-leaders]").textContent = trip.leaders;
    detail.querySelector("[data-trip-difficulty]").textContent = trip.difficulty;
    detail.querySelector("[data-trip-capacity]").textContent = trip.capacity;
    detail.querySelector("[data-trip-application-copy]").textContent = trip.applicationCopy;

    const status = detail.querySelector("[data-trip-application-status]");
    status.textContent = trip.applicationStatus;
    status.className = "status-pill " + trip.applicationClass;

    const apply = detail.querySelector("[data-apply-trip]");
    apply.textContent = trip.applyLabel;
    apply.disabled = slug === "joshua-tree" || slug === "sierras";
    apply.dataset.tripSlug = slug;

    const roster = detail.querySelector("[data-trip-roster]");
    roster.innerHTML = trip.roster.map(([name, role]) => {
      const initials = name.split(/\s+/).map(part => part[0]).join("").slice(0,2).toUpperCase();
      return '<div class="member-row"><span class="member-avatar">' + initials + '</span><div><strong>' + name + '</strong><span>' + role + '</span></div></div>';
    }).join("");

    detail.querySelector("[data-roster-count]").textContent = trip.roster.length + " listed";

    const gear = detail.querySelector("[data-trip-gear]");
    gear.innerHTML = trip.gear.map(([item, holder]) => '<div><strong>' + item + '</strong><span>' + holder + '</span></div>').join("");

    detail.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function closeTripDetail() {
    const detail = document.querySelector("[data-trip-detail]");
    const table = document.querySelector('[data-view-panel="trips"] .table-card');
    const toolbar = document.querySelector('[data-view-panel="trips"] .toolbar');
    if (detail) detail.hidden = true;
    if (table) table.hidden = false;
    if (toolbar) toolbar.hidden = false;
  }

  allNavButtons().forEach(button => {
    button.addEventListener("click", event => {
      const target = event.currentTarget.dataset.view;
      if (target) showView(target);
    });
  });

  document.querySelectorAll("[data-trip]").forEach(button => {
    button.addEventListener("click", () => openTripDetail(button.dataset.trip));
  });

  const closeTrip = document.querySelector("[data-close-trip]");
  if (closeTrip) closeTrip.addEventListener("click", closeTripDetail);

  const applyTrip = document.querySelector("[data-apply-trip]");
  if (applyTrip) {
    applyTrip.addEventListener("click", () => {
      const slug = applyTrip.dataset.tripSlug;
      const trip = tripData[slug];
      if (!trip || applyTrip.disabled) return;
      alert("Trip application form structure is the next layer. This button is ready to connect to trip-specific application questions.");
    });
  }

  document.querySelectorAll("[data-trip-filter]").forEach(button => {
    button.addEventListener("click", () => {
      document.querySelectorAll("[data-trip-filter]").forEach(b => b.classList.remove("active"));
      button.classList.add("active");
      const filter = button.dataset.tripFilter;
      document.querySelectorAll("[data-trip-row]").forEach(row => {
        row.hidden = filter !== "all" && row.dataset.filter !== filter;
      });
    });
  });

  const tripSearch = document.querySelector("[data-trip-search]");
  if (tripSearch) {
    tripSearch.addEventListener("input", () => {
      const q = tripSearch.value.trim().toLowerCase();
      document.querySelectorAll("[data-trip-row]").forEach(row => {
        row.hidden = q && !row.textContent.toLowerCase().includes(q);
      });
    });
  }

  const gearSearch = document.querySelector("[data-gear-search]");
  if (gearSearch) {
    gearSearch.addEventListener("input", () => {
      const q = gearSearch.value.trim().toLowerCase();
      document.querySelectorAll("[data-gear-table] tr").forEach(row => {
        row.hidden = q && !row.textContent.toLowerCase().includes(q);
      });
    });
  }

  const grantFile = document.querySelector("[data-grant-file]");
  const grantStatus = document.querySelector("[data-grant-status]");
  const grantSubmit = document.querySelector("[data-grant-submit]");
  if (grantFile && grantStatus && grantSubmit) {
    grantFile.addEventListener("change", () => {
      const file = grantFile.files && grantFile.files[0];
      if (!file) {
        grantStatus.textContent = "No file selected.";
        grantSubmit.disabled = true;
        return;
      }
      if (file.type !== "application/pdf") {
        grantStatus.textContent = "Please select a PDF.";
        grantSubmit.disabled = true;
        return;
      }
      grantStatus.textContent = file.name + " selected. Secure upload storage is not connected yet.";
      grantSubmit.disabled = false;
    });
    grantSubmit.addEventListener("click", () => {
      grantStatus.textContent = "Submission is intentionally disabled until secure PDF storage and account authentication are connected.";
    });
  }

  const profileForm = document.querySelector("[data-profile-form]");
  if (profileForm) {
    profileForm.addEventListener("submit", event => {
      event.preventDefault();
      const status = profileForm.querySelector("[data-profile-status]");
      if (status) status.textContent = "Profile form structure saved for backend connection.";
    });
  }

  document.querySelectorAll("[data-leader-tab]").forEach(button => {
    button.addEventListener("click", () => {
      const tab = button.dataset.leaderTab;
      document.querySelectorAll("[data-leader-tab]").forEach(b => b.classList.toggle("active", b === button));
      document.querySelectorAll("[data-leader-panel]").forEach(panel => {
        panel.hidden = panel.dataset.leaderPanel !== tab;
      });
    });
  });

  const menuToggle = document.querySelector("[data-menu-toggle]");
  if (menuToggle) {
    menuToggle.addEventListener("click", () => document.body.classList.toggle("menu-open"));
  }

  const accountToggle = document.querySelector("[data-account-toggle]");
  const accountMenu = document.querySelector("[data-account-menu]");
  if (accountToggle && accountMenu) {
    accountToggle.addEventListener("click", event => {
      event.stopPropagation();
      accountMenu.hidden = !accountMenu.hidden;
      accountToggle.setAttribute("aria-expanded", String(!accountMenu.hidden));
    });
    document.addEventListener("click", event => {
      if (!accountMenu.hidden && !accountMenu.contains(event.target)) {
        accountMenu.hidden = true;
        accountToggle.setAttribute("aria-expanded", "false");
      }
    });
  }

  window.addEventListener("hashchange", () => {
    const view = location.hash.replace("#", "");
    if (titles[view]) showView(view, false);
  });

  const initial = location.hash.replace("#", "");
  showView(titles[initial] ? initial : "dashboard", false);
})();