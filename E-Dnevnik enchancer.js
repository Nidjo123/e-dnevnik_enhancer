// ==UserScript==
// @name       E-Dnevnik enhancer
// @namespace  -
// @version    0.4
// @description Set of enhancements for E-Dnevnik project
// @match      https://ocjene.skole.hr/pregled/ocjene/*
// @copyright  2013+, Nikola Bunjevac
// @require    http://ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min.js
// @require    http://ajax.googleapis.com/ajax/libs/jqueryui/1.10.2/jquery-ui.min.js
// ==/UserScript==

$(document).ready(function() {
    var averages = [];
    var badMarks = 0;
    
	// subject mark averages
    $(".grades > table:first-child").each(function(index) {
        var sum = 0;
        var count = 0;
        var content = $(this).html();
        content = content.replace(/, /g, ""); // for handling more marks in one <td>
        var matcher = new RegExp(">[1-5]+<");
        var resp = 1;
        while (resp != null) {
            resp = matcher.exec(content);
            if (resp != null) {
                var ind = resp.index + 1;
                while (content[ind] !== '<') { // ...more marks in one <td>
                    sum += parseInt(content[ind], 10);  
                    count++;
                    ind++;
                }
                content = content.slice(ind + 1, content.length);
            }
        }
        if (count === 0 || parseFloat(sum/count).toFixed(2) === 0) return null; // no marks, leave it empty
        averages.push(parseFloat(sum / count).toFixed(2));
        $("tr:contains('ZAKLJUÈENO')", this).after('<tr><td class="activity bold">PROSJEK</td> <td colspan="10" class="t-center bold">' + averages[index] +  '</td></tr>');
    });
    
    if (averages.length === 0) return null; // no marks
    
    var sum = 0;
    for (var i = 0; i < averages.length; i++) {
        var m = averages[i];
        if (m - parseInt(m, 10) < 0.5)
        	m = Math.floor(m);
        else
            m = Math.ceil(m);
        sum += m;
    }
    
	// adds averages beside profesor's names
    var mark = sum / averages.length;
    
    $(".course").each(function(index) {
        $(".course-info", this).append(', <span id="prosjek" style="color:#baf">Prosjek: ' + averages[index] + '</span>');
        if (averages[index] < 2.0) {
            badMarks++;
            $("#prosjek", this).append(', <span style="color:red; font-weight: bold;">Trenutno padaš ovaj predmet!</span>');
        }
    });
    
	// final average mark and bad marks warning
    $(".sectionTitle").after('<div id="ukpros" style="color:#f55"><strong>Trenutni ukupni prosjek:</strong> ' + parseFloat(mark).toFixed(2) + '</div><br />');
    if (badMarks > 0)
        $("#ukpros").after('<div style="color:#f55"><strong>Trenutno imaš jedinica: ' + badMarks + '</strong></div>');
    
    $("#student-class").after('<div id="testovi" style="position: absolute; float: both; top: 75px; left: 10px; padding: 5px; width: 200px;"><br />' + 
								'<table id="tt"><th>Pisane provjere</th><tbody><tr id="prvi"></tr></tbody></table></div>');
    
	// exam table
    var curr_date = new Date();
    var dates = [];
    
    $(".grades").each(function() {
        $(".tasks-title:contains('Raspored')", this).next().children("tbody").children("tr").each(function() {
            if (!($(this).hasClass("inactive")) && $(this).children().length > 0 && $(this).children().is("td")) {
                var date = $(this).children("td").eq(0).html();
                var test = $(this).children("td").eq(1).html();
                var subject = $(this).parents().eq(3).prev().attr("id");
                var date_obj = new Date(date.slice(6, 10), date.slice(3, 5) - 1, date.slice(0, 2));
                var css = "";
                if (Math.round((date_obj-curr_date)/1000/60/60/24) <= 7)
                    css = "background-color: #fbb;";
                dates.push([date_obj, '<tr style="' + css + '"><td class="datum" style="background-color: #dde">' + date + 
                            '</td><td style="background-color: #ddd">' + test + "</td><td>" + subject + "</td></tr>"]);   
            }
        });
    });
    
	// date sorting
    var sort_asc = function(d1, d2) {
        if (d1[0] > d2[0]) return 1;
        return -1;
    };
    
    dates.sort(sort_asc);
    
    for (var i = 0; i < dates.length; i++) {
        $("#prvi").append(dates[i][1]);
    }
    
    $("#testovi").draggable();
});
