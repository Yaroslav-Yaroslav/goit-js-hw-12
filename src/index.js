import './css/styles.css';
import { Notify } from 'notiflix/build/notiflix-notify-aio';

import axios from 'axios';
axios.defaults.baseURL = 'https://pixabay.com/api/';
const API_KEY = '34607447-71623db8ef3f0e92797c3b5fc';

import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
let gallery = new SimpleLightbox('.gallery a');

const refs = {
  searchForm: document.querySelector('.search-form'),
  loadMoreBtn: document.querySelector('.load-more'),
  divGallery: document.querySelector('.gallery'),
};
refs.searchForm.addEventListener('submit', onSubmitForm);
refs.loadMoreBtn.addEventListener('click', onClickLoadMoreBtn);

let page = 1;
let urlSerchQuery = '';

function onSubmitForm(e) {
  e.preventDefault();
  const searchQuery = e.currentTarget.elements.searchQuery.value.trim();
  urlSerchQuery = searchQuery.replace(/\s+/g, '+');
  refreshData();
  fetchImages(urlSerchQuery, page).then(({ totalHits, hits }) => {
    if (totalHits === 0) {
      Notify.failure(
        'Sorry, there are no images matching your search query. Please try again.'
      );
    }
    if (totalHits > 0) {
      Notify.success(`Hooray! We found ${totalHits} images.`);
    }
    if (totalHits > 40) {
      showLoadMoreBtn();
    }
    appendMarkupGallery(hits);
  });
}

async function fetchImages(searchQuery, page) {
  const url = `?key=${API_KEY}&q=${searchQuery}&image_tipe=photo&orientation=horizontal&safesearch=true&page=${page}&per_page=40`;
  try {
    const { data } = await axios.get(url);
    console.log('data:', data);
    console.log('searchQuery:', searchQuery);
    console.log('page:', page);

    return data;
  } catch (error) {
    console.log(error);
  }
}
function markupGallery(images) {
  return images
    .map(
      ({
        webformatURL,
        largeImageURL,
        tags,
        likes,
        views,
        comments,
        downloads,
      }) =>
        `<a class="link" href="${largeImageURL}"><div class="photo-card">
      <div class="thumb"><img src="${webformatURL}" alt="${tags}" loading="lazy" /></div>
      <div class="info">
        <p class="info-item">
          <b>Likes</b> ${likes}
        </p>
        <p class="info-item">
          <b>Views</b> ${views}
        </p>
        <p class="info-item">
          <b>Comments</b> ${comments}
        </p>
        <p class="info-item">
          <b>Downloads</b> ${downloads}
        </p>
      </div>
    </div></a>`
    )
    .join('');
}
function appendMarkupGallery(images) {
  refs.divGallery.insertAdjacentHTML('beforeend', markupGallery(images));
  gallery.refresh();
}
function showLoadMoreBtn() {
  refs.loadMoreBtn.style.display = 'flex';
}
function hideLoadMoreBtn() {
  refs.loadMoreBtn.style.display = 'none';
}
function onClickLoadMoreBtn() {
  page += 1;
  fetchImages(urlSerchQuery, page).then(({ hits }) => {
    if (hits.length < 40) {
      hideLoadMoreBtn();
      Notify.info("We're sorry, but you've reached the end of search results.");
    }
    appendMarkupGallery(hits);
    const { height: cardHeight } = document
      .querySelector('.gallery')
      .firstElementChild.getBoundingClientRect();

    window.scrollBy({
      top: cardHeight * 2,
      behavior: 'smooth',
    });
  });
}

function refreshData() {
  page = 1;
  refs.divGallery.innerHTML = '';
  hideLoadMoreBtn();
}
