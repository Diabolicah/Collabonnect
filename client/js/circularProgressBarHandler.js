function updateCircularProgressBar(progressBar, percentage, background_color){
    background_color = background_color || "#FFF";
    const progress_color = percentage < 25 ? "#DC3545" : percentage < 50 ? "#FD7E14" : percentage < 75 ? "#FFC107" : "#20C997"
    progressBar.style = `background: radial-gradient(closest-side, ${background_color} 79%, transparent 80% 100%),
    conic-gradient(from 270deg, ${progress_color} 0%, ${progress_color} ${percentage}%, ${background_color} ${percentage}%);`
}