function populateSelectWithJSON(id, url) {
    let select = $("#" + id);
    $.getJSON(url, function (data) {
        $.each(data, function (key, entry) {
            select.append($('<option></option>').attr('value', entry.code).text(entry.name));
        })
    });
}