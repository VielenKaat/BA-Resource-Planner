let whitelist = {
    special: [],
    filter_type: [],
    filter_atk: [],
    filter_def: [],
    filter_star: [],
    filter_school: [],
    filter_weapon: [],
    length() {
        return this.special.length + this.filter_atk.length + this.filter_def.length + this.filter_school.length + this.filter_star.length + this.filter_type.length + this.filter_weapon.length;
    },
    getNonEmpty() {
        let toreturn = [];
        if (this.special.length > 0) toreturn.push(this.special);
        if (this.filter_atk.length > 0) toreturn.push(this.filter_atk);
        if (this.filter_def.length > 0) toreturn.push(this.filter_def);
        if (this.filter_star.length > 0) toreturn.push(this.filter_star);
        if (this.filter_school.length > 0) toreturn.push(this.filter_school);
        if (this.filter_type.length > 0) toreturn.push(this.filter_type);
        if (this.filter_weapon.length > 0) toreturn.push(this.filter_weapon);

        return toreturn;
    }
};

let style = null;
let isFiltersBuilt = false;
$(document).ready(function () {
    style = $("style#toggleViewStyle");
});

function toggleViewFilters() {
    buildFilterList();
    $("div#viewFilters").toggle();
}

function buildFilterList() {
    if (!charlist) return;
    if (isFiltersBuilt) return;
    
    isFiltersBuilt = true;
    let filters = getAcceptedDynamicFilters();

    let filterGroupElements = [
        buildFilterGroup("", {
            label: "Basic",
            options: ["Selected", "Deselected"]
        }),
    ];
    for(let type in filters) {
        filterGroupElements.push(buildFilterGroup(type+"_", filters[type]));
    }

    $("div#viewFilters").html(filterGroupElements.join("\n"));

    $("input.filter-option").change((e) => {
        assignClassFilters()
        let filter = $(e.currentTarget);
        let target = filter.attr("filter-target");
        const grouping = target.startsWith("filter_") ? target.split('_').splice(0,2).join("_") : "special";
        if (filter[0].checked) {
            filter.closest("label.filter-option-item").attr("ischecked", "true");
            if (whitelist[grouping].indexOf(target) < 0) {
                whitelist[grouping].push(target);
            }
        } else {
            filter.closest("label.filter-option-item").attr("ischecked", "false");
            whitelist[grouping] = whitelist[grouping].filter(filtered => filtered != target);
        }
        rebuildViewFilters();
    });
    function buildFilterGroup(prefix, data) {
        const label = data.label;
        let optionElements = [];
        for(const option of data.options) {
            optionElements.push(buildFilterElement(prefix, option));
        }

        return `<div class="filter-view-group"><label class="char-action-label filter-group-header">${label}</label><div class="filter-option-container">${optionElements.join("\n")}</div></div>`;
    }
    function buildFilterElement(prefix, label) {
        // <input class="filter-option" filter-target="test" type="checkbox"> TEST;
        let attr = label.toLowerCase().replaceAll(" ", "_");
        let target = `${prefix}${attr}`;

        return `<label class="filter-option-item" checked="false" for="${target}"><input class="filter-option" id="${target}" filter-target="${target}" type="checkbox"> ${label}</label>`;
    }

    function getAcceptedDynamicFilters() {
        let filterTypes = {
            filter_atk: {
                label: "Attack Type",
                options: []
            },
            filter_def: {
                label: "Defense Type",
                options: []
            },
            filter_star: {
                label: "Base Stars",
                options: []
            },
            filter_school: {
                label: "School",
                options: []
            },
            filter_type: {
                label: "Type",
                options: []
            },
            filter_weapon: {
                label: "Weapon Type",
                options: []
            }
        }

        for(const i in charlist) {
            const char = charlist[i];
            filterTypes.filter_atk.options.push(char.DamageType);
            filterTypes.filter_def.options.push(char.DefenseType);
            filterTypes.filter_school.options.push(char.School);
            filterTypes.filter_type.options.push(char.Type);
            filterTypes.filter_weapon.options.push(char.WeaponType);
            filterTypes.filter_star.options.push(char.BaseStar.toString());
        }
        for(const i in filterTypes) {
            // remove duplicates
            filterTypes[i].options = [...new Set(filterTypes[i].options)];
        }

        return filterTypes;
    }
}

function assignClassFilters() {
    for(const char of $("div.main-display-char.charBox:not(.added-filters)")) {
        const id = char.id.substring(5);
        const charInfo = charlist[id];
        let attributes = [
            "added-filters",
            "filter_atk_"+charInfo.DamageType.toLowerCase().replaceAll(" ", "_"),
            "filter_def_"+charInfo.DefenseType.toLowerCase().replaceAll(" ", "_"),
            "filter_star_"+charInfo.BaseStar,
            "filter_school_"+charInfo.School.toLowerCase().replaceAll(" ", "_"),
            "filter_type_"+charInfo.Type.toLowerCase().replaceAll(" ", "_"),
            "filter_weapon_"+charInfo.WeaponType.toLowerCase().replaceAll(" ", "_"),
        ]
        if (charInfo.JpOnly) {
            attributes.push("filter_in_jp");
        }
        $(char).addClass(attributes);
    }
}
const cartesian = (...a) => a.reduce((a, b) => a.flatMap(d => b.map(e => [d, e].flat())));

function rebuildViewFilters() {
    if (whitelist.length() == 0) {
        style.html("");
    } else {
        let styles = [
            "div.charBox.main-display-char { display: none; }",
            // "div.charBox.main-display-char."+whitelist.join(".")+" { display: block; }"
        ];
        const combos = cartesian(...whitelist.getNonEmpty());
        for(const combo of combos) {
            if (Array.isArray(combo))
                styles.push("div.charBox.main-display-char."+combo.join(".")+" { display: block; }");
            else
                styles.push("div.charBox.main-display-char."+combo+" { display: block; }");

        }

        style.html(styles.join("\n"));
    }
}

function resetViewFilters() {

    let filterLabels = document.getElementsByClassName("filter-option-item");
    let filterCheckboxes = document.getElementsByClassName("filter-option");

    for (let i = 0; i < filterLabels.length; i++) {

        if (filterLabels[i].getAttribute('ischecked')) {
            filterLabels[i].setAttribute('ischecked','false');
        }
    }

    for (let i = 0; i < filterCheckboxes.length; i++) {

        if (filterCheckboxes[i].checked) {
            filterCheckboxes[i].checked = false;
        }
    }

    whitelist.special = [];
    whitelist.filter_type = [];
    whitelist.filter_atk = [];
    whitelist.filter_def = [];
    whitelist.filter_star = [];
    whitelist.filter_school = [];
    whitelist.filter_weapon = [];

    rebuildViewFilters();
}