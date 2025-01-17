function get_cookie(name) {
    let value = document.cookie.match('(^|;) ?' + name + '=([^;]*)(;|$)');
    return value? value[2] : null; }


// 페이지 접속 시 실행하기
$(window.document).ready(function() {
    keep_out()
})

// 토큰 있을 시 이동 가능
function keep_out() {
    let token = get_cookie("X-AUTH-TOKEN");
    if (token) {}
    else {
        alert("로그인 후 이용해주세요")
        location.href = '/login.html';
    }
    
}

//토근 만료 시 로그인 창으로
function relogin(){
    alert('다시 로그인 하세요');
    window.location.replace("/login.html");
}

let day; // 여행 기간 (예 2박 3일)
let day_status // 선택된 d y 상 태 
let post_id // 현재 작성중인 post_id
let my_size = 0;
$(document).ready(function (){

    day = 1;
    day_status = 1;


    // 여행 설계 버튼 클릭시 게시물이 생성 
    if(localStorage.getItem('action') == 'create'){
        console.log("action 들어왔다.")
        create_post();
        read_schedule();
    }else{
        const urlSearchParams = new URLSearchParams(window.location.search);
        const params = Object.fromEntries(urlSearchParams.entries());
        post_id = params['id']
        get_post_info();
        console.log(post_id)
        console.log(day)
    }

    // 큰 여행 리스트, 그 안에 일정 생성
    create_plan(day);

    // 여행일 변경시 작동
    $('#select_day').on('change', function () {
        alert(this.value + '일치 일정을 추가해 주세요')
        day = this.value
        create_plan(day);
        read_schedule();
    });

})


// 게시물 생성하는 함수
function create_post(){
    let token = get_cookie("X-AUTH-TOKEN");
    console.log("craete_post in")
    $.ajax({
        type: "POST",
        url: "http://finalapp-env.eba-mcuzkehj.ap-northeast-2.elasticbeanstalk.com/user/plan/post",
        contentType: "application/json;",
        beforeSend: function (xhr) {
            xhr.setRequestHeader("Content-type","application/json");
            xhr.setRequestHeader("X-AUTH-TOKEN", token);
        },
        success: function(response){
            post_id = response;
            localStorage.setItem('action', 'null');
        }
    })
}

// 큰 계획 일정 만드는 함수
function create_plan(day){
    $('#day_plan').empty()

    for(let i=0; i<day; i++){
        let temp_html = `<div style="display: flex;" onclick="change_status(${i + 1});">
                            <a class="on_active"">${i + 1}일 </a>
                         </div>
                            <li class="list-group-item">
                                <ul class="list-group" id="schedule-${i + 1}" style="height: 200px; border-bottom: solid 2px rgb(194, 194, 194); list-style: none; overflow: auto;">
                                    
                                </ul>
                            </li>`
        $('#day_plan').append(temp_html);
    }
}

function change_status(num) {
    day_status = num;
    alert(day_status + '일을 선택했습니다. 일정을 추가해 주세요')
}

//작은 일정 만들어서 디비에 저장
function api_create_schedule(title, address, y, x, phone, url) {
    let token = get_cookie("X-AUTH-TOKEN");
    $.ajax({
        type: "POST",
        url: "http://finalapp-env.eba-mcuzkehj.ap-northeast-2.elasticbeanstalk.com/user/schedule",
        data: JSON.stringify({
            'postId': post_id,
            'date': day_status,
            'placeName': title,
            'address': address,
            'x': x,
            'y': y,
            'phone': phone,
            'link': url
        }),
        beforeSend: function (xhr) {
            xhr.setRequestHeader("Content-type","application/json");
            xhr.setRequestHeader("X-AUTH-TOKEN", token);
        },
        success: function (response) {
            console.log('api_create_schedule: ' + response)
            read_schedule();
        }
    })

}

// 디비에서 일정 받아와 화면에 그려주기
function read_schedule() {
    let token = get_cookie("X-AUTH-TOKEN");
    for (let i = 0; i < day; i++) {
        $(`#schedule-${i + 1}`).empty()
    }
    $.ajax({
        type: "GET",
        url: "http://finalapp-env.eba-mcuzkehj.ap-northeast-2.elasticbeanstalk.com/plan/post/" + post_id + "/schedules",
        beforeSend: function (xhr) {
            xhr.setRequestHeader("Content-type","application/json");
            xhr.setRequestHeader("X-AUTH-TOKEN", token);
        },
        success: function (response) {
            let schedules = response
            my_size = response.length;
            for (let i = 0; i < schedules.length; i++) {
                let schedule = schedules[i];
                let temp_html = `<li class="list-group-item" style="padding: 7px;">
                                        <a onclick="delete_schedule(${schedule.id})" style="float: right; color: red; font-size: 20px">×</a>
                                        <h5 style="display: flex;">
                                        <a href="${schedule.link}">${schedule.placeName}</a>
                                        </h5>
                                    <p style="font-size: 15px">${schedule.address}</p>
                                    <p style="font-size: 12px; color: green">${schedule.phone}</p>
                                </li>
                                <hr>
                                `
                $(`#schedule-${schedule.date}`).append(temp_html)
            }
        },
        error: function (xhr, ajaxOptions, thrownError) {
            console.log(xhr.status);
            console.log(thrownError);
        }
    })
}

// 일정 삭제
function delete_schedule(scheduleId) {
    let token = get_cookie("X-AUTH-TOKEN");
    console.log("들어왔다")
    $.ajax({
        type: "DELETE",
        url: "http://finalapp-env.eba-mcuzkehj.ap-northeast-2.elasticbeanstalk.com/user/schedule/" + scheduleId,
        beforeSend: function (xhr) {
            xhr.setRequestHeader("Content-type","application/json");
            xhr.setRequestHeader("X-AUTH-TOKEN", token);
        },
        success: function () {
            create_plan(day);
            read_schedule();
        }
    })
    
}


// 모든 일정 삭제
function delete_all(){
}


// 여행 게시물 저장
function save_post(){
    let token = get_cookie("X-AUTH-TOKEN");
    let title = $('#mytitle').val();
    let category = $("#select_category").val();
    let period = $("#select_day").val();
    let file = $('#file')[0];
    
    let formData = new FormData();
    formData.append("file", file.files[0]);
    if(title.length == 0){
        alert("제목을 입력해주세요")
        return;
    }
    else if(file.files.length === 0){
        alert("대표 이미지를 선택해주세요");
        return;
    }
    else if(title.length>30){
        alert("제목을 30글자 내로 지정해주세요")
        return;
    }
    $.ajax({
        type: "PUT",
        url: "http://finalapp-env.eba-mcuzkehj.ap-northeast-2.elasticbeanstalk.com/user/plan/post/" + post_id,
        data: JSON.stringify({
            'title' : title,
            'category' : category,
            'period' : period
        }),
        beforeSend: function (xhr) {
            xhr.setRequestHeader("Content-type","application/json");
            xhr.setRequestHeader("X-AUTH-TOKEN", token);
        },
        success: function () {
        }
    })

    console.log ('2번')
    $.ajax({
        type: "POST",
        url: "http://finalapp-env.eba-mcuzkehj.ap-northeast-2.elasticbeanstalk.com/user/plan/post/" + post_id + "/image?path=images",
        data: formData,
        processData: false,
        contentType: false,
        beforeSend: function (xhr) {
            xhr.setRequestHeader("X-AUTH-TOKEN", token);
        },
        success: function () {
            window.location='/home.html'
        }
    })
}

// 여행 게시물의 모든 일정 삭제
function delete_all(){
    let token = get_cookie("X-AUTH-TOKEN");
    $.ajax({
        type: "DELETE",
        url: "http://finalapp-env.eba-mcuzkehj.ap-northeast-2.elasticbeanstalk.com/user/plan/post/" + post_id + "/schedules",
        beforeSend: function (xhr) {
            xhr.setRequestHeader("X-AUTH-TOKEN", token);
        },
        success: function () {
            alert("일정을 초기화 했습니다.")
            read_schedule()
        }
    })
}

// 여행 게시물 정보 가져오기
function get_post_info(){
    let token = get_cookie("X-AUTH-TOKEN");
    $.ajax({
        type: "GET",
        url: "http://finalapp-env.eba-mcuzkehj.ap-northeast-2.elasticbeanstalk.com/plan/post/" + post_id,
        beforeSend: function (xhr) {
            xhr.setRequestHeader("X-AUTH-TOKEN", token);
        },
        success: function (response) {
            $('#mytitle').val(response.title);
            $("#select_category").val(response.category);
            console.log(response.category);
            $("#select_day").val(response.period);
            day = response.period
            read_schedule();
            create_plan(day)
        }
    })
}
