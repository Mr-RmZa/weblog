document.getElementById("imageUpload").onclick = function () {
  let xhttp = new XMLHttpRequest(); // create new AJAX request

  const selectedImage = document.getElementById("selectedImage");
  const imageStatus = document.getElementById("imageStatus");
  const progressDiv = document.getElementById("progressDiv");
  const progressBar = document.getElementById("progressBar");
  const uploadResult = document.getElementById("uploadResult");

  // xhttp.responseType = "json";

  xhttp.onreadystatechange = function () {
    if (xhttp.status === 200) {
      imageStatus.innerHTML = "Photo upload was successful"; //this.response.message
      uploadResult.innerHTML = this.responseText; //this.response.address
      selectedImage.value = "";
    } else {
      imageStatus.innerHTML = this.responseText;
      uploadResult.innerHTML = "";
    }
  };

  xhttp.open("POST", "/blog/upload");

  xhttp.upload.onprogress = function (e) {
    if (e.lengthComputable) {
      let result = Math.floor((e.loaded / e.total) * 100);
      if (result !== 100) {
        progressBar.innerHTML = result + "%";
        progressBar.style = "width:" + result + "%";
      } else {
        progressDiv.style = "display: none";
      }
    }
  };

  let formData = new FormData();

  if (selectedImage.files.length > 0) {
    const suffix = selectedImage.files[0].name.split(".");
    if (suffix[1] === "jpg") {
      progressDiv.style = "display: block";
      formData.append("image", selectedImage.files[0]);
      xhttp.send(formData);
    } else {
      imageStatus.innerHTML = "Only JPEG extension is supported";
    }
  } else {
    imageStatus.innerHTML = "You must select a photo to upload";
    uploadResult.innerHTML = "";
  }
};
