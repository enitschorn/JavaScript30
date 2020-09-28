const video = document.querySelector('.player')
const canvas = document.querySelector('.photo')
const ctx = canvas.getContext('2d')
const strip = document.querySelector('.strip')
const snap = document.querySelector('.snap')

const getVideo = () => {
  navigator.mediaDevices
    .getUserMedia({ video: true, audio: false })
    .then((localMediaStream) => {
      video.srcObject = localMediaStream
      video.play()
    })
    .catch((error) => {
      console.error(`OH NO!!!`, error)
    })
}

const paintToCanvas = () => {
  const { videoWidth: width, videoHeight: height } = video
  canvas.width = width
  canvas.height = height

  setInterval(() => {
    ctx.drawImage(video, 0, 0, width, height)

    // take the pixels out
    let pixels = ctx.getImageData(0, 0, width, height)
    // console.log(pixels) => for every pixel on the image, you get a r ed, a g reen, a b lue,  and a a lpha value in the pixels array

    // mess with them
    // pixels = redEffect(pixels)
    // pixels = rgbSplit(pixels)
    // ctx.globalAlpha = 0.1
    pixels = greenScreen(pixels)

    // return the pixels
    ctx.putImageData(pixels, 0, 0)
  }, 16)
}

const redEffect = (pixels) => {
  for (let i = 0; i < pixels.data.length; i += 4) {
    pixels.data[i + 0] = pixels.data[i + 0] + 100 // r
    pixels.data[i + 1] = pixels.data[i + 1] - 50 // g
    pixels.data[i + 2] = pixels.data[i + 2] * 0.5 // b
  }

  return pixels
}

const rgbSplit = (pixels) => {
  for (let i = 0; i < pixels.data.length; i += 4) {
    pixels.data[i - 150] = pixels.data[i + 0] // r
    pixels.data[i + 500] = pixels.data[i + 1] // g
    pixels.data[i - 550] = pixels.data[i + 2] // b
  }

  return pixels
}

const greenScreen = (pixels) => {
  const levels = {}

  document.querySelectorAll('.rgb input').forEach((input) => {
    levels[input.name] = input.value
  })

  console.log(levels)

  for (i = 0; i < pixels.data.length; i = i + 4) {
    red = pixels.data[i + 0]
    green = pixels.data[i + 1]
    blue = pixels.data[i + 2]
    alpha = pixels.data[i + 3]

    if (
      red >= levels.rmin &&
      green >= levels.gmin &&
      blue >= levels.bmin &&
      red <= levels.rmax &&
      green <= levels.gmax &&
      blue <= levels.bmax
    ) {
      // take it out!
      pixels.data[i + 3] = 0
    }
  }

  return pixels
}

const takePhoto = () => {
  snap.currentTime = 0
  snap.play()

  const data = canvas.toDataURL('image/jpeg')
  const link = document.createElement('a')
  link.href = data
  link.setAttribute('download', 'handsome')
  link.innerHTML = `<img src="${data}" alt="Great picture" />`
  strip.insertBefore(link, strip.firstChild)
}

getVideo()

video.addEventListener('canplay', paintToCanvas)
