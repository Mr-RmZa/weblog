document.getElementById("imageUpload").onclick = function () {
  const selectedImage = document.getElementById("selectedImage");
  const imageStatus = document.getElementById("imageStatus");
  const formData = new FormData();
  if (selectedImage.files.length > 0) {
    formData.append("image", selectedImage.files[0]);
    fetch("/blog/upload-image", {
      method: "POST",
      body: formData
    })
      .then((response) => {
        if (response.status === 200) {
          return response.text();
        } else {
          throw new Error("مشکلی از سمت سرور رخ داده است");
        }
      })
      .then((data) => {
        imageStatus.innerHTML = data;
      })
      .catch((error) => {
        imageStatus.innerHTML = error.message;
      });
  } else {
    imageStatus.innerHTML = "برای آپلود باید عکسی انتخاب کنید";
  }
};
