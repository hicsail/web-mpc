define(['jquery', 'controllers/clientController', 'controllers/tableController', 'controllers/usabilityController', 'helper/drop_sheet', 'spin', 'Ladda', 'ResizeSensor', 'alertify', 'table_template', 'bootstrap'],
  function ($, clientController, tableController, usabilityController, DropSheet, Spinner, Ladda, ResizeSensor, alertify, table_template) {

    function createQuestionText(text) {
      var p = document.createElement('p');
      p.classList.add('question-text');
      p.classList.add('help-block');
      p.innerHTML = text;
      return p;
    }

    function renderSurveyInputs(question, form) {
      var input_type = question.input_type;

      for (var i = 0; i < question.inputs.length; i++) {
        var div = document.createElement('div');
        $(div).attr('class', input_type);

        var label = document.createElement('label');
        div.appendChild(label);

        var input = document.createElement('input');
        $(input).attr('type', input_type)
          .attr('value', i + 1)
          .attr('name', 'opt' + input_type);

        label.appendChild(input);
        $(label).append(question.inputs[i].label);
        form.appendChild(div);
      }
    }

    // Creates survey
    function displaySurveyQuestions() {
      if (!('survey' in table_template) || Object.keys(table_template.survey).length === 0) {
        return;
      }

      $('#additional-questions').show();

      var questions = table_template.survey.questions;

      var questionsDiv = $('#questions');

      for (var i = 0; i < questions.length; i++) {
        var form = document.createElement('form');
        form.append(createQuestionText(questions[i].question_text));
        renderSurveyInputs(questions[i], form);
        questionsDiv.append(form);
      }
    }

    function createResizeSensors(tables) {
      tables.forEach(function (t) {
        var div = $('#' + t.rootElement.id);
        new ResizeSensor((div).find('.wtHider').first()[0], function () {
          tableController.updateWidth(tables);
        });
      });
    }

    function clientControllerView() {

      $(document).ready(function () {
        // Hide by default
        $('#additional-questions').hide();

        tableController.createTableElems(table_template.tables, '#tables-area');
        displaySurveyQuestions();
        // Create the tabless
        var tables = tableController.makeTables(table_template.tables);

        usabilityController.initialize();
        usabilityController.saveBrowser();
        // TODO
        //createResizeSensors(tables); THIS FUNCTION BREAKS THINGS I THINK! -IRA

        var totals_table = null;

        if (table_template.totals) {
          tableController.createTableElems([table_template.totals], '#totals-table');
          totals_table = tableController.makeTables([table_template.totals])[0];
        }

        var $verify = $('#verify');
        var $session = $('#session');
        var $participationCode = $('#participation-code');

        $('#session, #participation-code').on('blur', function (e) {
          e.target.dataset['did_blur'] = true;
          clientController.validateSessionInput(e.target, true);
        });

        $('#session, #participation-code').on('input', function (e) {
          if (e.target.dataset['did_blur']) {
            clientController.validateSessionInput(e.target, false);
          }
          $verify.prop('checked', false);
        });

        //Copied from trusted/session_data
        var getParameterByName = function (name) {
          name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
          var regex = new RegExp('[\\?&]' + name + '=([^&#]*)'),
            results = regex.exec(location.search);
          return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
        };

        $participationCode.val(getParameterByName('participationCode'));

        $session.val(getParameterByName('session'));

        if (String($session.val()).trim() !== '') {
          $session.blur();
        }
        if (String($participationCode.val()).trim() !== '') {
          $participationCode.blur();
        }

        // Remove error from radio buttons once you click on them
        $('form input[type=radio]').on('change', function (e) {
          $(e.target.form).removeClass('has-error');
          $verify.prop('checked', false);
        });

        window.scrollTo(0, 0);

        var sums = [0, 0]; // Internal total of Non NaNs values.
        var NaNs = [0, 0]; // Counts how many NaNs exist for every cell participating in a total.


        // Custom afterChange hook that computes the totals
        var afterChange = function (changes) {
          if (table_template.totals) {
            if (changes === null) {
              return;
            }

            var running = tableController.checkTotals(totals_table, changes, sums, NaNs);
            sums = running.sums;
            NaNs = running.NaNs;
          }
        };
        var $window, availableWidth, availableHeight;
        var calculateSize = function () {
          availableWidth = Math.max($('#drop-area').width(), 600);
          availableHeight = Math.max($window.height() - 250, 400);
        };

        $(document).ready(function () {
          $window = $(window);
          $window.on('resize', calculateSize);
        });


        function addValidationErrors(msg) {
          $verify.prop('checked', false);
          $('#submit').prop('disabled', true);
          $('#errors').css('display', 'block');

          for (var i = 0; i < msg.length; i++) {
            $('#validation-errors').append('<li><span class="help-block">' + msg[i] + '</span></li>');
          }
        }

        // Register when ready
        tables[0].addHook('afterChange', afterChange);
        for (var i = 0; i < tables.length - 1; i++) {
          tables[i].addHook('afterChange', function (changes, sources) {
            if (changes !== null) {
              $verify.prop('checked', false);
            }
          });
        }

        // Button clicks handlers
        $verify.click(function () {
          var la = Ladda.create(document.getElementById('verify'));
          la.start();

          clientController.validate(tables, function (result, msg) {
            $('#validation-errors').empty();
            la.stop();
            if (result) {
              $('#submit').prop('disabled', false);
              $('#errors').css('display', 'none');
            } else {
              addValidationErrors(msg);
            }
          });
        });

        $('#submit').click(function () {
          usabilityController.stopAllTimers();
          var la = Ladda.create(document.getElementById('submit'));
          la.start();

          clientController.validate(tables, function (result, msg) {
            $('#validation-errors').empty();
            if (!result) {
              la.stop();
              addValidationErrors(msg);
            } else {
              clientController.constructAndSend(tables, la);
            }
          });
        });
      });

      /* global $buoop */
      var $buoop = {
        vs: {i: 10, f: -4, o: -4, s: 8, c: -4},
        mobile: false,
        api: 4,
        noclose: true,
        reminder: 0,
        reminderClosed: 0,
        text: '<strong>Your web browser {brow_name} is not supported.</strong> Please upgrade to a more modern browser to participate in the Pacesetters Data Submission.'
      };

      function $buo_f() {
        var e = document.createElement('script');
        e.src = '//browser-update.org/update.min.js';
        document.body.appendChild(e);
      }

      try {
        if (document.readyState === 'loading') {
          document.addEventListener('DOMContentLoaded', $buo_f, false)
        } else {
          $buo_f();
        }
      } catch (e) {
        if (document.readyState !== 'complete') {
          window.attachEvent('onload', $buo_f)
        } else {
          $buo_f();
        }
      }
    }

    return clientControllerView;

  });