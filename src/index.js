import axios from 'axios';
import Notiflix from 'notiflix';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

document.addEventListener('DOMContentLoaded', function () {
  const searchForm = document.getElementById('search-form');
  const searchInput = searchForm.querySelector('input');
  const gallery = document.querySelector('.gallery');
  const loadMoreBtn = document.getElementById('load-more');

  const lightbox = new SimpleLightbox('.gallery a', {
    captionsData: 'alt',
    captionPosition: 'bottom',
  });

  loadMoreBtn.style.display = 'none';

  loadMoreBtn.addEventListener('click', loadMoreImages);

  const apiKey = '40978321-f1efcc4bfa3c901177745f4fe';
  const apiEndpoint = 'https://pixabay.com/api/';
  const perPage = 40;
  let currentPage = 1;

  searchForm.addEventListener('submit', async function (event) {
    event.preventDefault();

    const searchTerm = searchInput.value.trim();

    if (searchTerm === '') {
      Notiflix.Notify.failure('Please enter a search term.');
      return;
    }

    gallery.innerHTML = '';
    currentPage = 1;

    try {
      const response = await fetchImages(searchTerm);
      handleImageResponse(response);
    } catch (error) {
      console.error('Error fetching images:', error);
      Notiflix.Notify.failure('Failed to fetch images. Please try again.');
    }
  });

  async function loadMoreImages() {
    try {
      currentPage++;
      const searchTerm = searchInput.value.trim();
      const response = await fetchImages(searchTerm);
      handleImageResponse(response);
    } catch (error) {
      console.error('Error fetching more images:', error);
      Notiflix.Notify.failure('Failed to load more images. Please try again.');
    }
  }

  async function fetchImages(searchTerm) {
    try {
      const response = await axios.get(apiEndpoint, {
        params: {
          key: apiKey,
          q: searchTerm,
          image_type: 'photo',
          orientation: 'horizontal',
          safesearch: true,
          page: currentPage,
          per_page: perPage,
        },
      });

      return response.data;
    } catch (error) {
      console.error('Error fetching images:', error);
      throw new Error('Failed to fetch images. Please try again.');
    }
  }

  function handleImageResponse(response) {
    if (response.hits.length === 0) {
      Notiflix.Notify.info(
        'Sorry, there are no images matching your search query. Please try again.'
      );
    } else {
      response.hits.forEach(image => {
        renderImageCard(image);
      });

      lightbox.refresh();

      if (response.totalHits > currentPage * perPage) {
        loadMoreBtn.style.display = 'block';
      } else {
        loadMoreBtn.style.display = 'none';
        Notiflix.Notify.info(
          "We're sorry, but you've reached the end of search results."
        );
      }
    }
  }

  function renderImageCard(image) {
    const photoCard = document.createElement('div');
    photoCard.classList.add('photo-card');

    const link = document.createElement('a');
    link.href = image.largeImageURL;
    link.setAttribute('data-lightbox', 'gallery');

    const img = document.createElement('img');
    img.src = image.webformatURL;
    img.alt = image.tags;
    img.loading = 'lazy';

    const infoDiv = document.createElement('div');
    infoDiv.classList.add('info');

    ['likes', 'views', 'comments', 'downloads'].forEach(item => {
      const p = document.createElement('p');
      p.classList.add('info-item');
      p.innerHTML = `<b>${item.charAt(0).toUpperCase() + item.slice(1)}:</b> ${
        image[item]
      }`;
      infoDiv.appendChild(p);
    });

    link.appendChild(img);
    photoCard.appendChild(link);
    photoCard.appendChild(infoDiv);

    gallery.appendChild(photoCard);
  }
});
