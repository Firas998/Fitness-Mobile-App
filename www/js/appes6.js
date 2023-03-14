var url = "http://carmor.polytechnique.fr:60471";
var mapsloaded = false;
function loaded() {
  mapsloaded = true;
}
var interval = {
  intervals: new Set(),
  add(interval) {
    this.intervals.add(interval);
  },
  clearAll() {
    for (var id of this.intervals) {
      this.intervals.delete(id);
      clearInterval(id);
    }
  },
};

$(document).ready(function () {
  let intervalcur = setInterval(() => {
    $.ajax({
      method: "get",
      url: url + "/count_non_lu.php",
      dataType: "json",
      xhrFields: {
        withCredentials: true,
      },
      beforeSend: function (xhr) {
        xhr.setRequestHeader("Authorization", "Bearer " + localStorage.getItem("token"));
      },
    }).done(function (data) {
      $("#badgemessage").html(data);
    });
  }, 500);
  $(window).on("hashchange", route);

  function route() {
    $("#bodybuttons").show();
    localStorage.removeItem("idsalle");
    interval.clearAll();
    console.log(interval);
    var hash = window.location.hash;
    switch (hash) {
      default:
        $.get(
          "template/login.tpl.html",
          function (template) {
            $("#modalexo").modal("hide");
            $("#my-content").html(template);
            $("#bodybuttons").hide();
            $("#connect").click(function () {
              oAuthConnect()
                .done(function (data) {
                  console.log(data);
                  if (data["access_token"]) localStorage.setItem("token", data["access_token"]);
                  window.location.hash = "#search";
                  alert("Welcome Back");
                })
                .fail(function (xhr, status, error) {
                  var err = eval("(" + xhr.responseText + ")");
                  alert(error);
                });
            });
          },
          "html"
        );
        break;
      case "#messenger":
        $.get(
          "template/messenger.tpl.html",
          function (template) {
            $("#my-content").html(template);
            var text = localStorage.getItem("username");
            $("#mylogin").html(text);
            $("#option-1").prop("checked", true);
            const left = function () {
              $.ajax({
                method: "get",
                url: url + "/affiche_list.php",
                dataType: "json",
                xhrFields: {
                  withCredentials: true,
                },
                beforeSend: function (xhr) {
                  xhr.setRequestHeader("Authorization", "Bearer " + localStorage.getItem("token"));
                },
              }).done(function (data) {
                $.get(
                  "template/chatusers.tpl.html",
                  function (template2) {
                    var content = Mustache.render(template2, data);
                    $("#chatusers").html(content);
                  },
                  "html"
                );
              });
            };
            const right = function () {
              console.log("dans la meme salle");
              $.ajax({
                method: "get",
                url: url + "/affiche_contacts.php",
                dataType: "json",
                xhrFields: {
                  withCredentials: true,
                },
                beforeSend: function (xhr) {
                  xhr.setRequestHeader("Authorization", "Bearer " + localStorage.getItem("token"));
                },
              }).done(function (data) {
                $.get(
                  "template/salle.tpl.html",
                  function (template2) {
                    var content1 = Mustache.render(template2, data);
                    $("#chatusers").html(content1);
                  },
                  "html"
                );
              });
            };
            left();
            var intervalleft = setInterval(left, 500);
            interval.add(intervalleft);
            $('.radiowrapper input[type="radio"]').on("change", function () {
              if ($("#option-1").is(":checked")) {
                interval.clearAll();
                left();
                var intervalleft = setInterval(left, 500);
                interval.add(intervalleft);
              } else {
                interval.clearAll();
                right();
                var intervalright = setInterval(right, 5000);
                interval.add(intervalright);
              }
            });
          },
          "html"
        );
        break;
      case "#messaging":
        $.get(
          "template/messaging.tpl.html",
          function (template) {
            $("#my-content").html(template);
            const initchat = function (test) {
              var destinataire = localStorage.getItem("destinataire");
              $.ajax({
                method: "post",
                url: url + "/affiche_message.php",
                data: { lui: destinataire },
                dataType: "json",
                xhrFields: {
                  withCredentials: true,
                },
                beforeSend: function (xhr) {
                  xhr.setRequestHeader("Authorization", "Bearer " + localStorage.getItem("token"));
                },
              }).done(function (data) {
                let oldposition = $("#messaging")[0].scrollTop + 500;
                let oldlength = $("#messaging")[0].scrollHeight;
                console.log(oldposition, oldlength);
                $.get(
                  "template/chat.tpl.html",
                  function (template2) {
                    var content = Mustache.render(template2, data);
                    $("#messaging").html(content);
                  },
                  "html"
                ).done(function () {
                  let newlength = $("#messaging")[0].scrollHeight;
                  console.log(newlength);
                  if (test == true) {
                    console.log("true");
                    $("#messaging").scrollTop(newlength - 500);
                  } else {
                    if (oldposition == oldlength) {
                      console.log("same");
                      $("#messaging").scrollTop(newlength - 500);
                    } else {
                      $("#messaging").scrollTop(oldposition - 500);
                    }
                  }
                });
              });
            };
            $("#sendbutton").click(function () {
              var destinataire = localStorage.getItem("destinataire");
              var message = $("#sendinput").val();
              $.ajax({
                method: "post",
                url: url + "/envoyer_message.php",
                data: { lui: destinataire, message: message },
                dataType: "json",
                xhrFields: {
                  withCredentials: true,
                },
                beforeSend: function (xhr) {
                  xhr.setRequestHeader("Authorization", "Bearer " + localStorage.getItem("token"));
                },
              }).done(function () {
                initchat();
              });
              $("#sendinput").val("");
            });

            initchat(true);
            let intervalcur = setInterval(() => {
              initchat(false);
            }, 500);
            interval.add(intervalcur);
          },
          "html"
        );
        break;
      case "#search":
        $.get(
          "template/Search.tpl.html",
          function (template) {
            var content = Mustache.render(template, []);
            $("#my-content").html(content);

            $("#Searchsubmit").click(function () {
              $(".importprog").off("click");
              if ($("#searchnom").is(":checked")) {
                $.ajax({
                  method: "post",
                  url: url + "/recherche_programme_par_nom.php",
                  data: { keyword: $("#keyword").val() },
                  dataType: "json",
                  xhrFields: {
                    withCredentials: true,
                  },
                  beforeSend: function (xhr) {
                    xhr.setRequestHeader("Authorization", "Bearer " + localStorage.getItem("token"));
                  },
                }).done(function (data) {
                  $.get(
                    "template/searched.tpl.html",
                    function (template) {
                      var content = Mustache.render(template, data);
                      $("#my-content-search").html(content);
                      $(".exopicture").each(function () {
                        var curSrc = $(this).attr("src");
                        if (!(curSrc == null || curSrc == "")) {
                          $(this).attr("src", url + "/upload/" + curSrc + ".jpg");
                        }
                      });
                      $(document).on("click", ".importprog", function (event) {
                        var button = $(event.target);
                        var ID = button.data("whatever");
                        $.ajax({
                          method: "post",
                          url: url + "/import.php",
                          data: { prog: ID, impo: new Date().toISOString().slice(0, 10) },
                          dataType: "json",
                          xhrFields: {
                            withCredentials: true,
                          },
                          beforeSend: function (xhr) {
                            xhr.setRequestHeader("Authorization", "Bearer " + localStorage.getItem("token"));
                          },
                        }).done(function (datta) {
                          if (datta["success"] == 1) {
                            alert("Programme importé avec succès");
                          } else {
                            alert(datta["error"]);
                          }
                        });
                      });
                    },
                    "html"
                  );
                });
              } else {
                $.ajax({
                  method: "post",
                  url: url + "/recherche_programme_par_login.php",
                  data: { keyword: $("#keyword").val() },
                  dataType: "json",
                  xhrFields: {
                    withCredentials: true,
                  },
                  beforeSend: function (xhr) {
                    xhr.setRequestHeader("Authorization", "Bearer " + localStorage.getItem("token"));
                  },
                }).done(function (data) {
                  $.get(
                    "template/searched.tpl.html",
                    function (template) {
                      var content = Mustache.render(template, data);
                      $("#my-content-search").html(content);
                      $(".exopicture").each(function () {
                        var curSrc = $(this).attr("src");
                        if (!(curSrc == null || curSrc == "")) {
                          $(this).attr("src", url + "/upload/" + curSrc + ".jpg");
                        }
                      });
                      $(document).on("click", ".importprog", function (event) {
                        var button = $(event.target);
                        var ID = button.data("whatever");
                        $.ajax({
                          method: "post",
                          url: url + "/import.php",
                          data: { prog: ID, impo: new Date().toISOString().slice(0, 10) },
                          dataType: "json",
                          xhrFields: {
                            withCredentials: true,
                          },
                          beforeSend: function (xhr) {
                            xhr.setRequestHeader("Authorization", "Bearer " + localStorage.getItem("token"));
                          },
                        }).done(function (datta) {
                          if (datta["success"] == 1) {
                            alert("Programme importé avec succès");
                          } else {
                            alert(datta["error"]);
                          }
                        });
                      });
                    },
                    "html"
                  );
                });
              }
            });
          },
          "html"
        );
        break;
      case "#created":
        $.get(
          "template/created.tpl.html",
          function (template) {
            $("#my-content").html(template);
            $.ajax({
              method: "get",
              url: url + "/creations.php",
              dataType: "json",
              xhrFields: {
                withCredentials: true,
              },
              beforeSend: function (xhr) {
                // login + mdp pour se connecter à l'API
                xhr.setRequestHeader("Authorization", "Bearer " + localStorage.getItem("token"));
              },
            }).done(function (data) {
              var content = Mustache.render(template, data);
              $("#my-content").html(content);
              $(".exopicture").each(function () {
                var curSrc = $(this).attr("src");
                if (!(curSrc == null || curSrc == "")) {
                  $(this).attr("src", url + "/upload/" + curSrc + ".jpg");
                }
              });
              $(document).on("click", ".modifyprogram", function (event) {
                var button = $(event.target);
                var ID = button.data("whatever");
                console.log(ID);
                localStorage.setItem("programcreation", ID);
                window.location.hash = "#create";
              });
              $("#modalprog").on("shown.bs.modal", function (event) {
                $("#annulerprog").click(function () {
                  $("#creerprog").off("click");
                  $("#annulerprog").off("click");
                  $("#modalprog").modal("hide");
                  $("#nameprog").val("");
                });

                $("#creerprog").on("click", function () {
                  let name = $("#nameprog").val();
                  $("#nameprog").val("");
                  let files = $("#file2")[0].files;
                  let today = new Date().toISOString().slice(0, 10);
                  $.ajax({
                    method: "post",
                    url: url + "/ajouter_programmes.php",
                    data: { nom: name, date: today },
                    dataType: "json",
                    xhrFields: {
                      withCredentials: true,
                    },
                    beforeSend: function (xhr) {
                      xhr.setRequestHeader("Authorization", "Bearer " + localStorage.getItem("token"));
                    },
                  }).done(function (data2) {
                    if (data2["success"] == "1") {
                      if (files.length > 0) {
                        let formData = new FormData();
                        formData.append("photo", files[0]);
                        formData.append("id", data2["id"]);
                        $.ajax({
                          url: url + "/upload_prog.php",
                          data: formData,
                          type: "POST",
                          contentType: false,
                          processData: false,
                        });
                      }
                      $("#file2").val(null);
                      $("#modalprog").modal("hide");
                      $("#annulerprog").off("click");
                      $("#creerprog").off("click");
                      localStorage.setItem("programcreation", data2["id"]);
                      window.location.hash = "#create";
                    } else {
                      alert(data["error"]);
                    }
                  });
                });
              });
            });
          },
          "html"
        );
        break;
      case "#Matchmaking":
        $.get(
          "template/Matchmaking.tpl.html",
          function (template) {
            $("#my-content").html(template);
            var interval = setInterval(function () {
              if (mapsloaded) {
                console.log("hi");
                allgoogle();
                clearInterval(interval);
              }
            }, 1000);
            function allgoogle() {
              navigator.geolocation.getCurrentPosition(onSuccess, onError, {
                maximumAge: 10000,
                timeout: 300000,
                enableHighAccuracy: true,
              });

              let map;
              let service;
              let infowindow;
              function onError(error) {
                console.log(error);
              }

              function onSuccess(Location) {
                const currentlocation = new google.maps.LatLng(Location.coords.latitude, Location.coords.longitude);

                infowindow = new google.maps.InfoWindow();
                map = new google.maps.Map($("#map")[0], {
                  center: currentlocation,
                  zoom: 12,
                });

                const request = {
                  location: currentlocation,
                  radius: "10000",
                  type: ["gym"],
                };
                service = new google.maps.places.PlacesService(map);
                service.nearbySearch(request, allmarkers);
              }

              function allmarkers(results, status) {
                if (status == google.maps.places.PlacesServiceStatus.OK) {
                  for (var i = 0; i < results.length; i++) {
                    createMarker(results[i]);
                  }
                }
              }
              function createMarker(place) {
                if (!place.geometry || !place.geometry.location) return;
                console.log("hi");

                const marker = new google.maps.Marker({
                  map,
                  position: place.geometry.location,
                });

                google.maps.event.addListener(marker, "click", (event) => {
                  infowindow.setContent(place.name || "");
                  infowindow.open(map, marker);
                  localStorage.setItem("idsalle", place.place_id);
                });
              }
            }
            $("#confirmmap").click(function () {
              if (localStorage.getItem("idsalle") === null) {
                alert("Veuillez séléctionner une salle de sport d'abord");
              } else {
                $.ajax({
                  method: "post",
                  url: url + "/ajoute_salle.php",
                  data: { salle: localStorage.getItem("idsalle") },
                  dataType: "json",
                  xhrFields: {
                    withCredentials: true,
                  },
                  beforeSend: function (xhr) {
                    xhr.setRequestHeader("Authorization", "Bearer " + localStorage.getItem("token"));
                  },
                });
                console.log("yes works");
                window.location.hash = "#messenger";
                alert("Votre choix a bien été confirmé.");
              }
            });
          },
          "html"
        );
        break;
      case "#calendar":
        $.get(
          "template/calendar.tpl.html",
          function (template) {
            const Months = ["Janvier", "Février", "Mars", "Avril", "May", "Juin", "Juillet", "Aout", "Septembre", "Octobre", "Novembre", "Décembre"];
            function daysInMonth(year, month) {
              return new Date(year, month, 0).getDate();
            }
            $("#my-content").html(template);
            const date = new Date();
            const build = function (Currentyear, Currentmonth) {
              $("#calendarbox").empty();
              $("#calendardays").empty();
              var CurrentNBDays = daysInMonth(Currentyear, Currentmonth + 1);
              var firstDay = new Date(Currentyear, Currentmonth, 1).getDay();
              $("#month").text(Months[date.getMonth()] + " ");
              $("#year").text(date.getFullYear());
              $("#calendardays").append('<div class="calendar__day">M</div>');
              $("#calendardays").append('<div class="calendar__day">T</div>');
              $("#calendardays").append('<div class="calendar__day">W</div>');
              $("#calendardays").append('<div class="calendar__day">T</div>');
              $("#calendardays").append('<div class="calendar__day">F</div>');
              $("#calendardays").append('<div class="calendar__day">S</div>');
              $("#calendardays").append('<div class="calendar__day">S</div>');
              for (i = 0; i < (firstDay + 6) % 7; i++) {
                $("#calendardays").append('<div class="calendar__number"></div>');
              }
              for (j = 0; j < CurrentNBDays; j++) {
                $("#calendardays").append('<div class="calendar__number" id="jour-' + (j + 1) + '">' + (j + 1) + "</div>");
              }
              $.ajax({
                method: "post",
                url: url + "/affiche_calendrier.php",
                data: { mois: Currentmonth + 1, annee: Currentyear },
                dataType: "json",
                xhrFields: {
                  withCredentials: true,
                },
                beforeSend: function (xhr) {
                  xhr.setRequestHeader("Authorization", "Bearer " + localStorage.getItem("token"));
                },
              }).done(function (data) {
                for (var i = 0; i < data.length; i++) {
                  var id = data[i];
                  var ID = "jour-" + id;
                  $("#" + ID).addClass("eventbut");
                }
                $(document).on("click", ".eventbut", function (event) {
                  console.log("hi");
                  var button = $(event.target);
                  var ID = button.attr("id");
                  ID = ID.replace("jour-", "");
                  console.log(ID);
                  $.ajax({
                    method: "post",
                    url: url + "/affiche_jour.php",
                    data: { jour: ID, mois: Currentmonth + 1, annee: Currentyear },
                    dataType: "json",
                    xhrFields: {
                      withCredentials: true,
                    },
                    beforeSend: function (xhr) {
                      xhr.setRequestHeader("Authorization", "Bearer " + localStorage.getItem("token"));
                    },
                  }).done(function (data2) {
                    $.get(
                      "template/calevent.tpl.html",
                      function (template2) {
                        var content = Mustache.render(template2, data2);
                        $("#calendarbox").html(content);
                      },
                      "html"
                    );
                  });
                });
              });
            };
            const init = function () {
              build(date.getFullYear(), date.getMonth());
            };
            init();
            $("#leftmonth").click(function () {
              date.setMonth(date.getMonth() - 1);
              init();
            });
            $("#rightmonth").click(function () {
              date.setMonth(date.getMonth() + 1);
              init();
            });
          },
          "html"
        );
        break;
      case "#laufend":
        $.get(
          "template/currentexercise.tpl.html",
          function (template) {
            $("#my-content").html(template);
            var id = localStorage.getItem("currentprogid");
            $.ajax({
              method: "POST",
              url: url + "/afficher_prog.php",
              data: { id: id },
              dataType: "json",
              xhrFields: {
                withCredentials: true,
              },
              beforeSend: function (xhr) {
                xhr.setRequestHeader("Authorization", "Bearer " + localStorage.getItem("token"));
              },
            }).done(function (data) {
              console.log(data);
              $("#my-content").html(template);
              const exo = function (cnt) {
                $("#currentexo .exo-header").text(data[cnt].exo);
                $("#currentexo .exo-title").text(data[cnt].descri);
                $("#currentexo .exo-text").text(data[cnt].time);
                var curSrc = data[cnt].imagesrc;
                $("#currentexo .exopicture").attr("src", url + "/upload/" + curSrc + ".jpg");
                $("#seconds").addClass("hide");
                $("#currentexo button").on("click", function () {
                  $("#currentexo button").off("click");
                  $("#currentexo button").addClass("hide");
                  $("#seconds").removeClass("hide");
                  var time = data[cnt].pause;
                  $("#seconds").html(time);
                  var timer = setInterval(() => {
                    time = time - 1;
                    $("#seconds").html(time);
                  }, 1000);
                  setTimeout(function () {
                    clearInterval(timer);
                    if (cnt + 1 >= data.length) {
                      var date = new Date();
                      $.ajax({
                        method: "post",
                        url: url + "/ajoute_calendrier.php",
                        data: { jour: date.getDate(), id: id, mois: date.getMonth() + 1, annee: date.getFullYear() },
                        dataType: "json",
                        xhrFields: {
                          withCredentials: true,
                        },
                        beforeSend: function (xhr) {
                          xhr.setRequestHeader("Authorization", "Bearer " + localStorage.getItem("token"));
                        },
                      });
                      window.location.hash = "#trainplan";
                      alert("Programme achevé");
                    } else {
                      exo(cnt + 1);
                      $("#currentexo button").removeClass("hide");
                    }
                  }, data[cnt].pause * 1000 + 1000);
                });
              };
              exo(0)();
            });
          },
          "html"
        );
        break;

      case "#trainplan":
        $.get(
          "template/trainplan.tpl.html",
          function (template) {
            $("#my-content").html(template);
            $.ajax({
              method: "get",
              url: url + "/imported_catalogue.php",
              dataType: "json",
              xhrFields: {
                withCredentials: true,
              },
              beforeSend: function (xhr) {
                xhr.setRequestHeader("Authorization", "Bearer " + localStorage.getItem("token"));
              },
            }).done(function (data) {
              var content = Mustache.render(template, data);
              $("#my-content").html(content);
              $(".program_img img").each(function () {
                var curSrc = $(this).attr("src");
                if (!(curSrc == null || curSrc == "")) {
                  $(this).attr("src", url + "/upload/" + curSrc + ".jpg");
                }
              });
              $(document).on("click", ".program_cta", function (event) {
                var button = $(event.target);
                var ID = button.data("whatever");
                $.ajax({
                  method: "post",
                  url: url + "/CountExo.php",
                  data: { id: ID },
                  dataType: "json",
                  xhrFields: {
                    withCredentials: true,
                  },
                  beforeSend: function (xhr) {
                    xhr.setRequestHeader("Authorization", "Bearer " + localStorage.getItem("token"));
                  },
                }).done(function (numberofexos) {
                  console.log(numberofexos);
                  if (numberofexos == 0) {
                    alert("Il n'y a aucun exercice dans ce programme");
                  } else {
                    localStorage.setItem("currentprogid", ID);
                    window.location.hash = "#laufend";
                  }
                });
              });
              $(document).on("click", ".program_det", function (event) {
                var button = $(event.target);
                var ID = button.data("whatever");
                console.log(ID);
                localStorage.setItem("programdetails", ID);
                window.location.hash = "#show";
              });
            });
          },
          "html"
        );
        break;
      case "#show":
        $.get(
          "template/show.tpl.html",

          function (template) {
            var programid = localStorage.getItem("programdetails");
            $.ajax({
              method: "post",
              url: url + "/afficher_prog.php",
              data: { id: programid },
              dataType: "json",
              xhrFields: {
                withCredentials: true,
              },
              beforeSend: function (xhr) {
                xhr.setRequestHeader("Authorization", "Bearer " + localStorage.getItem("token"));
              },
            }).done(function (data) {
              var content = Mustache.render(template, data);
              $("#my-content").html(content);
              $(".program_img img").each(function () {
                var curSrc = $(this).attr("src");
                if (!(curSrc == null || curSrc == "")) {
                  $(this).attr("src", url + "/upload/" + curSrc + ".jpg");
                }
              });
            });
          },
          "html"
        );
        break;
      case "#log":
        $.get(
          "template/log.tpl.html",
          function (template) {
            $("#bodybuttons").hide();
            $("#my-content").html(template);
            $("#register").click(function () {
              var login = $("#login").val();
              var pass = $("#pass").val();
              var passbis = $("#passbis").val();
              var nom = $("#nom").val();
              var prenom = $("#prenom").val();
              var email = $("#email").val();
              var birthday = $("#birthday").val();
              var birthmonth = $("#birthmonth").val();
              var birthyear = $("#birthyear").val();
              $.post(url + "/register.php", { identifiant: login, password: pass, confirmation: passbis, fname: prenom, lname: nom, email: email, birthday: birthday, birthmonth: birthmonth, birthyear: birthyear }, function (data) {
                if (data["success"] === 1) {
                  oAuthConnect().done(function (data) {
                    if (data["access_token"]) localStorage.setItem("token", data["access_token"]);
                    window.location.hash = "#search";
                    alert("Bienvenur sur XFitness");
                  });
                } else {
                  alert(data["error"]);
                }
              });
            });
          },
          "html"
        );
        break;
      case "#create":
        $.get(
          "template/create.tpl.html",

          function (template) {
            var programid = localStorage.getItem("programcreation");
            $.ajax({
              method: "post",
              url: url + "/afficher_prog.php",
              data: { id: programid },
              dataType: "json",
              xhrFields: {
                withCredentials: true,
              },
              beforeSend: function (xhr) {
                xhr.setRequestHeader("Authorization", "Bearer " + localStorage.getItem("token"));
              },
            }).done(function (data) {
              for (var i = 0; i < data.length; i++) {
                if (!(data[i]["imagesrc"] == "")) {
                  data[i]["imagesrc"] = url + "/upload/" + data[i]["imagesrc"] + ".jpg";
                }
              }
              const Addevents = function () {
                $(".deleteexo").on("click", function (event) {
                  event.stopPropagation();
                  event.stopImmediatePropagation();
                  console.log("hi");
                  var button = $(event.target);
                  var IDDELETE = button.data("whatever");
                  let Index = ItemCtrl.getItemById(IDDELETE);
                  data.splice(Index, 1);
                  var content = Mustache.render(template, data);
                  $("#my-content").html(content);
                  clearevents();
                  Addevents();
                  $("#allex").sortable({
                    stop: ItemCtrl.sortEventHandler,
                  });
                  $.ajax({
                    method: "post",
                    url: url + "/DeleteExo.php",
                    data: { id: IDDELETE },
                    dataType: "json",
                    xhrFields: {
                      withCredentials: true,
                    },
                    beforeSend: function (xhr) {
                      xhr.setRequestHeader("Authorization", "Bearer " + localStorage.getItem("token"));
                    },
                  });
                });
              };
              const clearevents = function () {
                $(".deleteexo").off("click");
              };
              const ItemCtrl = (function () {
                return {
                  addItem: function (id, name, rep, rest, desc, imagesrc) {
                    data.push({ exo: name, descri: desc, time: rep, pause: rest, id: id, imagesrc: imagesrc });
                  },
                  logData: function () {
                    return data;
                  },
                  EditItem: function (id, name, rep, rest, desc, imagesrc) {
                    var index = ItemCtrl.getItemById(id);
                    if (imagesrc == null) {
                      data[index] = { exo: name, descri: desc, time: rep, pause: rest, id: id, imagesrc: data[index][imagesrc] };
                    } else {
                      data[index] = { exo: name, descri: desc, time: rep, pause: rest, id: id, imagesrc: imagesrc };
                    }
                  },
                  sortEventHandler: function () {
                    var father = $("#allex").children(".cardexo");
                    var datatosend = [];
                    for (let i = 0; i < father.length; i++) {
                      var id = father[i].id.replace("item-", "");
                      var index = ItemCtrl.getItemById(id);
                      datatosend.push({ id: id, order: i + 1 });
                      if (index != i) {
                        let tmp = data[i];
                        data[i] = data[index];
                        data[index] = tmp;
                      }
                    }
                    console.log(datatosend);
                    $.ajax({
                      method: "post",
                      url: url + "/changeorder.php",
                      data: { data: datatosend },
                      dataType: "json",
                      xhrFields: {
                        withCredentials: true,
                      },
                      beforeSend: function (xhr) {
                        xhr.setRequestHeader("Authorization", "Bearer " + localStorage.getItem("token"));
                      },
                    });
                  },
                  getItemById: function (id) {
                    let found = 0;
                    for (var i = 0; i < data.length; i++) {
                      if (data[i]["id"] == id) {
                        found = i;
                      }
                    }
                    return found;
                  },
                };
              })();
              var progorder = data.length;
              var content = Mustache.render(template, data);
              $("#my-content").html(content);
              clearevents();
              Addevents();
              $("#allex").sortable({
                stop: ItemCtrl.sortEventHandler,
              });
              $("textarea").keyup((e) => {
                var sHeight = e.target.scrollHeight;
                $("textarea").css("height", sHeight + "px");
              });
              $("#modalexo").on("shown.bs.modal", function (event) {
                var button = $(event.relatedTarget);
                var classesbouton = button[0].classList;
                if (classesbouton.contains("add")) {
                  $("#annulerexo").on("click", function () {
                    $("#creerexo").off("click");
                    $("#annulerexo").off("click");
                    $("#modalexo").modal("hide");
                    $("#reps").val("");
                    $("#name").val("");
                    $("#desc").val("");
                    $("#rest").val("");
                    $("#file").val(null);
                  });
                  $("#creerexo").on("click", function () {
                    let reps = $("#reps").val();
                    let name = $("#name").val();
                    let desc = $("#desc").val();
                    let rest = $("#rest").val();
                    $("#reps").val("");
                    $("#name").val("");
                    $("#desc").val("");
                    $("#rest").val("");
                    var imagesrc;
                    $.ajax({
                      method: "post",
                      url: url + "/addProgContent.php",
                      data: { id: programid, exo: name, descri: desc, time: reps, pause: rest, order: ++progorder },
                      dataType: "json",
                      xhrFields: {
                        withCredentials: true,
                      },
                      beforeSend: function (xhr) {
                        xhr.setRequestHeader("Authorization", "Bearer " + localStorage.getItem("token"));
                      },
                    }).done(function (datas) {
                      let files = $("#file")[0].files;

                      if (files.length > 0) {
                        let formData = new FormData();
                        formData.append("photo", files[0]);
                        formData.append("id", datas);
                        $.ajax({
                          url: url + "/upload_exo.php",
                          data: formData,
                          type: "POST",
                          contentType: false,
                          processData: false,
                        }).done(function (response) {
                          imagesrc = url + "/upload/" + response["path"] + ".jpg";
                          $("#file").val(null);
                          console.log(imagesrc);
                          ItemCtrl.addItem(datas, name, reps, rest, desc, imagesrc);
                          var content = Mustache.render(template, data);
                          $("#modalexo").modal("hide");
                          $("#creerexo").off("click");
                          $("#annulerexo").off("click");
                          $("#my-content").html(content);
                          $("#allex").sortable({
                            stop: ItemCtrl.sortEventHandler,
                          });
                          clearevents();
                          Addevents();
                        });
                      } else {
                        $("#file").val(null);
                        ItemCtrl.addItem(datas, name, reps, rest, desc, "");
                        console.log(ItemCtrl.logData());
                        var content = Mustache.render(template, data);
                        $("#modalexo").modal("hide");
                        $("#creerexo").off("click");
                        $("#annulerexo").off("click");
                        $("#my-content").html(content);
                        $("#allex").sortable({
                          stop: ItemCtrl.sortEventHandler,
                        });
                        clearevents();
                        Addevents();
                      }
                    });
                  });
                } else if (classesbouton.contains("edit")) {
                  console.log(ItemCtrl.logData());
                  var ID = button.data("whatever");
                  let Item = data[ItemCtrl.getItemById(ID)];
                  $("#reps").val(Item["time"]);
                  $("#name").val(Item["exo"]);
                  $("#desc").val(Item["descri"]);
                  $("#rest").val(Item["pause"]);
                  let imagesrc = Item["imagesrc"];
                  console.log($("#file")[0].files.length);
                  $("#annulerexo").on("click", function () {
                    console.log($("#file")[0].files);
                    $("#creerexo").off("click");
                    $("#annulerexo").off("click");
                    $("#modalexo").modal("hide");
                    $("#ID").val("");
                    $("#sets").val("");
                    $("#reps").val("");
                    $("#name").val("");
                    $("#desc").val("");
                    $("#rest").val("");
                    $("#file").val(null);
                  });
                  $("#creerexo").on("click", function () {
                    let reps = $("#reps").val();
                    let name = $("#name").val();
                    let desc = $("#desc").val();
                    let rest = $("#rest").val();
                    $("#reps").val("");
                    $("#name").val("");
                    $("#desc").val("");
                    $("#rest").val("");
                    console.log($("#file")[0].files.length);
                    let files = $("#file")[0].files;
                    if (files.length > 0) {
                      console.log("hi");
                      let formData = new FormData();
                      formData.append("photo", files[0]);
                      formData.append("id", ID);
                      $.ajax({
                        url: url + "/update_image_exo.php",
                        data: formData,
                        type: "POST",
                        contentType: false,
                        processData: false,
                      }).done(function (response) {
                        $("#modalexo").modal("hide");
                        $("#creerexo").off("click");
                        $("#annulerexo").off("click");
                        let imagesrc = url + "/upload/" + response["path"] + ".jpg";
                        ItemCtrl.EditItem(ID, name, reps, rest, desc, imagesrc);
                        var content = Mustache.render(template, ItemCtrl.logData());
                        $("#my-content").html(content);
                        clearevents();
                        Addevents();
                        $("#allex").sortable({
                          stop: ItemCtrl.sortEventHandler,
                        });
                      });
                    } else {
                      ItemCtrl.EditItem(ID, name, reps, rest, desc, imagesrc);
                      var content = Mustache.render(template, ItemCtrl.logData());
                      $("#my-content").html(content);
                      clearevents();
                      Addevents();
                      $("#allex").sortable({
                        stop: ItemCtrl.sortEventHandler,
                      });
                      $("#modalexo").modal("hide");
                      $("#creerexo").off("click");
                      $("#annulerexo").off("click");
                    }
                    $("#file").val(null);

                    $.ajax({
                      method: "post",
                      url: url + "/edit_exo.php",
                      data: { id: ID, exo: name, descri: desc, time: reps, pause: rest },
                      xhrFields: {
                        withCredentials: true,
                      },
                      beforeSend: function (xhr) {
                        xhr.setRequestHeader("Authorization", "Bearer " + localStorage.getItem("token"));
                      },
                    });
                  });
                }
              });
            });
          },
          "html"
        );
        break;
    }
  }
  route();
});
