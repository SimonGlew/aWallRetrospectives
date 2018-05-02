let joinSessionValues = ['sessionName', 'sprintNumber', 'username', 'password', 'joinConfirmBtn'],
    createSessionValues = ['sessionName', 'sprintNumber', 'boardInfo', 'boardName', 'retrospectiveType',  'password', 'createConfirmBtn'],
    retrospectiveTypes = [];

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

        $('#username').css('display', 'block')
        $('#username').hide('fast')

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
        if(!retrospectiveTypes.length){
            $.get('/api/retrospectivetypes', { 
            }, function (data) {
                let retroHTML = '';
                data.forEach(function (type) {
                    let item = '<button class="dropdown-item" type="button" id='+ type._id +'>' + type.name + '</button>'; 
                    retroHTML += item;
                    retrospectiveTypes.push(type);
                })
                $('#retrospectiveDropdown').html(retroHTML);
                createSessionBtnClick();
            })
        }else{
            createSessionBtnClick();
        }
    }
})

$('.dropdown-menu').on('click', 'button', function(e){
    currentRetrospectiveMethod = $(this).attr('id');
    $('#dropdownMenuButton').html($(this).text())
});
    

$('#createConfirmBtn').click(function () {
    if (!$('#sessionNameValue').val() || !$('#sprintNumberValue').val() || !$('#boardNameValue').val() || !$('#passwordValue').val() || !currentRetrospectiveMethod) {
        $('#errLabel').text("Please enter all fields correctly");
    }
    else {
        $('#errLabel').text('');
        $.get('/api/session/create/', { 
            projectName: $('#sessionNameValue').val(),
            sprintNumber: $('#sprintNumberValue').val(),
            boardName: $('#boardNameValue').val(),
            password: $('#passwordValue').val(),
            username: 'moderator',
            retrospectiveType: currentRetrospectiveMethod
        }, function (data) {
            if(data.err){
                $('#errLabel').text(data.err);
            } 
            else {
                localStorage.setItem('username', 'moderator');
                window.location = data._id + "/" + data.retrospectiveType.name + '/mod/check'
            }
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
            if(data.err){
                $('#errLabel').text(data.err);
            } 
            else {
                localStorage.setItem('username', $('#usernameValue').val());
                let endURL = $('#usernameValue').val() == 'moderator' ? '/mod/check' : '/par'
                window.location = data._id + "/" + data.retrospectiveType.name + endURL;  
            } 
        })
    }
})


function createSessionBtnClick(){
    $('#errLabel').text('');
    currentState = 'c';
    $('#username').css('display', 'none')
    $('#username').hide('fast')

    $('#joinConfirmBtn').css('display', 'none')
    $('#joinConfirmBtn').hide('fast')

    $('#boardInfo').css('display', '')
    $('#boardInfo').hide('fast')

    $('#createConfirmBtn').css('display', 'block')
    $('#createConfirmBtn').hide('fast')

    joinSessionValues.forEach(function (ele) {
        $('#' + ele).hide('fast')
    })

    createSessionValues.forEach(function (ele) {
        $('#' + ele).show('medium', 'linear')
    })
};