function updateCircularProgressBar(progressBar, percentage, backgroundColor){
    backgroundColor = backgroundColor || "#FFF";
    const progressColor = percentage < 25 ? "#DC3545" : percentage < 50 ? "#FD7E14" : percentage < 75 ? "#FFC107" : "#20C997"
    progressBar.style = `background: radial-gradient(closest-side, ${backgroundColor} 79%, transparent 80% 100%),
    conic-gradient(from 270deg, ${progressColor} 0%, ${progressColor} ${percentage}%, ${backgroundColor} ${percentage}%);`
}