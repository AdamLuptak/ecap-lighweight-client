


console.log("sfddf")


// var temperatures=[]

// for (var i = 0; i < 200000; i++) {
//     temperatures[i] = '"125","456","789"';
// }

// localStorage.setItem("temperatures",  JSON.stringify(temperatures));

// var blobObject = null;

// function createDownloadLink(anchorSelector, str, fileName){

//     if(window.navigator.msSaveOrOpenBlob) {
//         var fileData = [str];
//         blobObject = new Blob(fileData);
//         $(anchorSelector).click(function(){
//             window.navigator.msSaveOrOpenBlob(blobObject, fileName);
//         });
//     } else {
//         var url = "data:text/plain;charset=utf-8," + encodeURIComponent(str);
//         $(anchorSelector).attr("href", url);
//     }
// }

// $(function () {
//     var str =localStorage.getItem("temperatures");
//     createDownloadLink("#export",str,"dinesh.txt");
// });
// var a = window.document.createElement('a');
// var contentType = 'text/csv';
// var CSV = JSON.parse(localStorage.getItem("temperatures"));
// CSV=CSV.join('\n')
// var csvFile = new Blob([CSV], {type: contentType});


// var interval = 1000;  // 1000 = 1 second, 3000 = 3 seconds
// function doAjax() {
//     $.ajax({
//         type: 'GET',
//         url: 'http://www.mocky.io/v2/5a75f6b92e000057006ab249',
//         data: $(this).serialize(),
//         dataType: 'json',
//         success: function (data) {
//             console.log(data);
//                     $('#hidden').val(data);// first set the value     
//                 },
//                 complete: function (data) {
//                     // Schedule the next
//                     setTimeout(doAjax, interval);
//                 }
//             });
// }
// // setTimeout(doAjax, interval);

// window.onbeforeunload = confirmExit;

// function confirmExit(){
//     return "hai!";
// }
// a.href = window.URL.createObjectURL(csvFile);
// a.download = 'test.csv';

// // Append anchor to body.
// document.body.appendChild(a);
// // a.click();

// // Remove anchor from body
// // document.body.removeChild(a);
//  function sleep(delay) {
//         var start = new Date().getTime();
//         while (new Date().getTime() < start + delay);
//       }

// window.addEventListener("beforeunload", function (e) {
//   var confirmationMessage = "\o/";
//   // a.click();

//         // sleep(5000)


//   (e || window.event).returnValue = confirmationMessage;     //Gecko + IE
//   return confirmationMessage;                                //Webkit, Safari, Chrome etc.
// });