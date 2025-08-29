// Dummy course data
const courses = [
  {
    id: 'course-1',
    title: 'JavaScript Fundamentals',
    description: 'Learn the basics of JavaScript, the language of the web.',
    thumbnail: 'https://img.youtube.com/vi/upDLs1sn7g4/hqdefault.jpg',
    videoId: 'upDLs1sn7g4',
  },
  {
    id: 'course-2',
    title: 'Introduction to Python',
    description: 'Understand Python fundamentals and start coding today.',
    thumbnail: 'https://img.youtube.com/vi/rfscVS0vtbw/hqdefault.jpg',
    videoId: 'UrsmFxEIp5k',
  },
  {
    id: 'course-3',
    title: 'CSS Flexbox and Grid',
    description: 'Master modern CSS layout techniques with Flexbox and Grid.',
    thumbnail: 'https://img.youtube.com/vi/JJSoEo8JSnc/hqdefault.jpg',
    videoId: 'Edsxf_NBFrw',
  },
  {
    id: 'course-4',
    title: 'React Basics',
    description: 'Get started with React and build interactive UIs.',
    thumbnail: 'https://img.youtube.com/vi/DLX62G4lc44/hqdefault.jpg',
    videoId: 'RGKi6LSPDLU',
  }
];

// Elements
const courseListPage = document.getElementById('course-list-page');
const courseDetailPage = document.getElementById('course-detail-page');
const coursesContainer = document.getElementById('courses-container');
const breadcrumbBack = document.getElementById('back-to-list');
const courseTitleElem = document.getElementById('course-title');
const progressBarFill = document.getElementById('progress-bar-fill');
const courseNameBreadcrumb = document.getElementById('course-name-breadcrumb');

// YouTube player variables
let player;
let currentCourseId = null;
let progressUpdateInterval = null;

// Load course list
function loadCourseList() {
  coursesContainer.innerHTML = '';
  courses.forEach(course => {
    const card = document.createElement('div');
    card.className = 'course-card';
    card.innerHTML = `
      <div class="course-thumbnail" style="background-image:url('${course.thumbnail}')"></div>
      <div class="course-info">
        <div class="course-title">${course.title}</div>
        <div class="course-description">${course.description}</div>
        <button class="btn" data-courseid="${course.id}">View Course</button>
      </div>
    `;
    coursesContainer.appendChild(card);
  });
  // Add event listeners for buttons
  const buttons = coursesContainer.querySelectorAll('.btn');
  buttons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const courseId = btn.getAttribute('data-courseid');
      openCourseDetail(courseId);
    });
  });
}

// Back to list
breadcrumbBack.addEventListener('click', () => {
  courseDetailPage.style.display = 'none';
  courseListPage.style.display = 'block';
  if(player) {
    player.stopVideo();
  }
  currentCourseId = null;
  clearInterval(progressUpdateInterval);
});

// Progress storage key format
function getProgressStorageKey(courseId) {
  return `elearning-progress-${courseId}`;
}

// Get progress from localStorage
function getCourseProgress(courseId) {
  const progress = localStorage.getItem(getProgressStorageKey(courseId));
  return progress ? Number(progress) : 0;
}

// Save progress to localStorage
function saveCourseProgress(courseId, progress) {
  localStorage.setItem(getProgressStorageKey(courseId), progress);
}

// Update progress bar UI
function updateProgressBar(progress) {
  const clampedProgress = Math.min(Math.max(progress, 0), 100);
  progressBarFill.style.width = clampedProgress + '%';
}

// Open course detail with YouTube player
function openCourseDetail(courseId) {
  const course = courses.find(c => c.id === courseId);
  if(!course) return;

  currentCourseId = courseId;

  // Show detail page, hide list page
  courseTitleElem.textContent = course.title;
  courseNameBreadcrumb.textContent = course.title;
  courseListPage.style.display = 'none';
  courseDetailPage.style.display = 'block';

  // Load stored progress
  const savedProgress = getCourseProgress(courseId);
  updateProgressBar(savedProgress);

  // Initialize or load YouTube player with the selected video
  if(player) {
    player.loadVideoById(course.videoId);
  } else {
    createYouTubePlayer(course.videoId);
  }
}

// Create YouTube Player
function createYouTubePlayer(videoId) {
  player = new YT.Player('player', {
    height: '390',
    width: '640',
    videoId: videoId,
    playerVars: {
      modestbranding: 1,
      rel: 0,
      controls: 1,
      disablekb: 0,
      fs: 1,
      autoplay: 0,
    },
    events: {
      onReady: onPlayerReady,
      onStateChange: onPlayerStateChange
    }
  });
}

// When YouTube Player is ready
function onPlayerReady(event) {
  // Start periodic progress update every 1 second
  startProgressUpdater();
}

// YouTube Player state changes
function onPlayerStateChange(event) {
  if (event.data == YT.PlayerState.PLAYING) {
    startProgressUpdater();
  } else {
    stopProgressUpdater();
    // Save progress when not playing
    saveCurrentProgressOnce();
  }
}

// Interval to update progress every second while playing
function startProgressUpdater() {
  if(progressUpdateInterval) return;
  progressUpdateInterval = setInterval(() => {
    saveCurrentProgressOnce();
  }, 1000);
}

// Stop the progress updating interval
function stopProgressUpdater() {
  if(progressUpdateInterval) {
    clearInterval(progressUpdateInterval);
    progressUpdateInterval = null;
  }
}

// Save current progress once, calculating percentage of video watched
function saveCurrentProgressOnce() {
  if(!player || !currentCourseId) return;
  const duration = player.getDuration();
  const currentTime = player.getCurrentTime();
  if(!duration || duration === 0) return;
  let progressPercent = (currentTime / duration) * 100;
  progressPercent = Math.floor(progressPercent);
  if(progressPercent > 100) progressPercent = 100;

  // Only save if progress percentage is higher than stored to avoid regress
  const storedProgress = getCourseProgress(currentCourseId);
  if(progressPercent > storedProgress) {
    saveCourseProgress(currentCourseId, progressPercent);
    updateProgressBar(progressPercent);
  }
}

// Load YouTube Iframe API script asynchronously
function loadYouTubeAPI() {
  return new Promise((resolve) => {
    if(window.YT && window.YT.Player) {
      resolve();
    } else {
      const tag = document.createElement('script');
      tag.src = "https://www.youtube.com/iframe_api";
      document.body.appendChild(tag);
      window.onYouTubeIframeAPIReady = () => {
        resolve();
      };
    }
  });
}

// Initialization
async function init() {
  loadCourseList();
  await loadYouTubeAPI();
}

init();
