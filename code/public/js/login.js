let joinSessionValues = ['sessionName', 'sprintNumber', 'username', 'password', 'joinConfirmBtn'],
    createSessionValues = ['sessionName', 'sprintNumber', 'boardName', 'password', 'createConfirmBtn'];

let currentState = 'j';

$('#joinSessionBtn').click(function () {
    if (currentState != 'j') {
        $('#errLabel').text('');
        currentState = 'j';
        $('#boardName').css('display', 'none')
        $('#boardName').hide('fast')

        $('#createConfirmBtn').css('display', 'none')
        $('#createConfirmBtn').hide('fast')

        $('#username').css('display', 'block')
        $('#username').hide('fast')

        $('#joinConfirmBtn').css('display', 'block')
        $('#joinConfirmBtn').hide('fast')

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
        $('#errLabel').text('');
        currentState = 'c';
        $('#username').css('display', 'none')
        $('#username').hide('fast')

        $('#joinConfirmBtn').css('display', 'none')
        $('#joinConfirmBtn').hide('fast')

        $('#boardName').css('display', 'block')
        $('#boardName').hide('fast')

        $('#createConfirmBtn').css('display', 'block')
        $('#createConfirmBtn').hide('fast')

        joinSessionValues.forEach(function (ele) {
            $('#' + ele).hide('fast')
        })

        createSessionValues.forEach(function (ele) {
            $('#' + ele).show('medium', 'linear')
        })
    }
})

$('#createConfirmBtn').click(function () {
    if (!$('#sessionNameValue').val() || !$('#sprintNumberValue').val() || !$('#boardNameValue').val() || !$('#passwordValue').val()) {
        $('#errLabel').text("Please enter all fields correctly");
    }
    else {
        $('#errLabel').text('');
        $.get('/api/session/create/', { 
            projectName: $('#sessionNameValue').val(),
            sprintNumber: $('#sprintNumberValue').val(),
            boardName: $('#boardNameValue').val(),
            password: $('#passwordValue').val()
        }, function (data) {
            if(data.err) $('#errLabel').text(data.err);
            else window.location = "/mod/" + data._id 
        })
    }
})

$('#joinConfirmBtn').click(function () {
    if (!$('#sessionNameValue').val() || !$('#sprintNumberValue').val() || !$('#usernameValue').val() || !$('#passwordValue').val()) {
        $('#errLabel').text("Please enter all fields correctly");
    }
    else {
        $('#errLabel').text('');
        $.get('/api/session/join/', { 
            projectName: $('#sessionNameValue').val(),
            sprintNumber: $('#sprintNumberValue').val(),
            username: $('#usernameValue').val(),
            password: $('#passwordValue').val()
        }, function (data) {
            if(data.err) $('#errLabel').text(data.err);
            else window.location = "/par/" + data._id
        })
    }
})