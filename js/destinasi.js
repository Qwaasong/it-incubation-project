/* Fitur lokal destinasi: menampilkan keterangan tambahan dari tombol kartu. */
// Fungsi ini dipanggil tombol kartu untuk menampilkan keterangan destinasi.
function tampilkanInfo(destinasi) {
  let info = "";

  if (destinasi === "bromo") {
    info =
      "Gunung Bromo berada di kawasan Taman Nasional Bromo Tengger Semeru. Destinasi ini terkenal dengan pemandangan sunrise dan lautan pasir.";
  } else if (destinasi === "coban") {
    info =
      "Air Terjun Coban Rondo merupakan wisata alam dengan air terjun dan suasana pegunungan yang sejuk.";
  } else if (destinasi === "museum") {
    info =
      "Museum Angkut berada di Kota Batu dan memiliki berbagai koleksi kendaraan serta area bertema dari berbagai negara.";
  } else if (destinasi === "jatimpark") {
    info =
      "Jatim Park 2 merupakan wisata edukasi di Kota Batu yang terdiri dari Museum Satwa dan Batu Secret Zoo.";
  }

  document.getElementById("isiInfo").innerHTML = info;

  document.getElementById("info").scrollIntoView({
    behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
      ? "auto"
      : "smooth",
  });
}
