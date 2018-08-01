let joinSessionValues = ['sessionName', 'sprintNumber', 'username', 'moderator', 'password', 'joinConfirmBtn'],
    createSessionValues = ['sessionName', 'sprintNumber', 'boardInfo', 'boardName', 'retrospectiveType', 'password', 'datepicker', 'createConfirmBtn'],
    retrospectiveTypes = [];

var isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

if(isMobile) {
    $('#mobile').css('display', 'block')
    $('#nonMobile').css('display', 'none')
}

$(document).ready(function() {
    $('#datepicker').datepicker();
});

let currentState = 'j',
    currentRetrospectiveMethod = null;

$('#joinSessionBtn').click(function () {
    if (currentState != 'j') {
        $('#errLabel').text('');
        currentState = 'j';

        $('#boardInfo').css('display', 'none')
        $('#boardInfo').hide('fast')

        $('#createConfirmBtn').css('display', 'none')
        $('#createConfirmBtn').hide('fast')

        $('#datepicker').css('display', 'none')
        $('#datepicker').hide('fast')

        $('#username').css('display', 'block')
        $('#username').hide('fast')

        $('#moderator').css('display', 'block')
        $('#moderator').hide('fast')

        $('#joinConfirmBtn').css('display', 'block')
        $('#joinConfirmBtn').hide('fast')

        currentRetrospectiveMethod = null;
        $('#dropdownMenuButton').html('Select a Retrospective Type')

        createSessionValues.forEach(function (ele) {
            $('#' + ele).hide('fast')
        })

        joinSessionValues.forEach(function (ele) {
            $('#' + ele).show('medium', 'linear')
        })


    }
});

$('#createSessionBtn').click(function () {
    if (currentState != 'c') {
        if (!retrospectiveTypes.length) {
            $.get('/api/retrospectivetypes', {
            }, function (data) {
                let retroHTML = '';
                data.forEach(function (type) {
                    let item = '<button class="dropdown-item" type="button" id=' + type._id + '>' + type.name + '</button>';
                    retroHTML += item;
                    retrospectiveTypes.push(type);
                })
                $('#retrospectiveDropdown').html(retroHTML);
                createSessionBtnClick();
            })
        } else {
            createSessionBtnClick();
        }
    }
})

$('.dropdown-menu').on('click', 'button', function (e) {
    currentRetrospectiveMethod = $(this).attr('id');
    $('#dropdownMenuButton').html($(this).text())
});


$('#createConfirmBtn').click(function () {

    console.log($('#start').val(), $('#end').val())

    if (!$('#sessionNameValue').val() || !$('#sprintNumberValue').val() || !$('#boardNameValue').val() || !$('#passwordValue').val() || !currentRetrospectiveMethod) {
        $('#errLabel').text("Please enter all fields correctly");
    }
    else {
        let startDate = new Date($('#start').val()), endDate = new Date($('#end').val())
        console.log(startDate, endDate)

        $('#errLabel').text('');
        $.get('/api/session/create/', {
            projectName: $('#sessionNameValue').val(),
            sprintNumber: $('#sprintNumberValue').val(),
            boardName: $('#boardNameValue').val(),
            password: $('#passwordValue').val(),
            startDate: startDate,
            endDate: endDate,
            username: 'moderator',
            retrospectiveType: currentRetrospectiveMethod
        }, function (data) {
            if (data.err) {
                $('#errLabel').text(data.err);
            }
            else {
                localStorage.setItem('username', 'moderator');
                localStorage.setItem('sprint', $('#sprintNumberValue').val());
                window.location = 'session/' + data._id + "/type/" + data.retrospectiveType.name + '/mod'
            }
        })
    }
})

$('#joinConfirmBtn').click(function () {
    let checked = $('#loginAsModerator').is(":checked")

    if (!$('#sessionNameValue').val() || !$('#sprintNumberValue').val() || (!$('#usernameValue').val() && !checked)  || !$('#passwordValue').val()) {
        $('#errLabel').text("Please enter all fields correctly");
    }
    else {
        $('#errLabel').text('');
        $.get('/api/session/join/', {
            projectName: $('#sessionNameValue').val(),
            sprintNumber: $('#sprintNumberValue').val(),
            username: (checked ? 'mod' : $('#usernameValue').val()),
            password: $('#passwordValue').val()
        }, function (data) {
            if (data.err) {
                $('#errLabel').text(data.err);
            }
            else {
                localStorage.setItem('username', $('#usernameValue').val());
                localStorage.setItem('sprint', $('#sprintNumberValue').val());
                let endURL = ($('#usernameValue').val() == 'mod' || checked) ? '/mod' : '/par'
                window.location = 'session/' + data._id + "/type/" + data.retrospectiveType.name + endURL;
            }
        })
    }
})

$('#joinConfirmBtnMobile').click(function () {
    if (!$('#sessionNameValueMobile').val() || !$('#sprintNumberValueMobile').val() || !$('#usernameValueMobile').val() || !$('#passwordValueMobile').val()) {
        $('#errLabelMobile').text("Please enter all fields correctly");
    }
    else {
        $('#errLabelMobile').text('');
        $.get('/api/session/join/', {
            projectName: $('#sessionNameValueMobile').val(),
            sprintNumber: $('#sprintNumberValueMobile').val(),
            username: $('#usernameValueMobile').val(),
            password: $('#passwordValueMobile').val()
        }, function (data) {
            if (data.err) {
                $('#errLabelMobile').text(data.err);
            }
            else {
                console.log(data)
                localStorage.setItem('username', $('#usernameValueMobile').val());
                let endURL = $('#usernameValueMobile').val() == 'mod' ? '/mod' : '/par'
                window.location = 'session/' + data._id + "/type/" + data.retrospectiveType.name + endURL;
            }
        })
    }
})


function createSessionBtnClick() {
    $('#errLabel').text('');
    currentState = 'c';
    $('#username').css('display', 'none')
    $('#username').hide('fast')

    $('#joinConfirmBtn').css('display', 'none')
    $('#joinConfirmBtn').hide('fast')

    $('#boardInfo').css('display', '')
    $('#boardInfo').hide('fast')

    $('#datepicker').css('display', '')
    $('#datepicker').hide('fast')

    $('#createConfirmBtn').css('display', 'block')
    $('#createConfirmBtn').hide('fast')

    joinSessionValues.forEach(function (ele) {
        $('#' + ele).hide('fast')
    })

    createSessionValues.forEach(function (ele) {
        $('#' + ele).show('medium', 'linear')
    })
};