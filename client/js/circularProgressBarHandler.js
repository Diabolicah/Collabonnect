function updateCircularProgressBar(progressBar, percentage){
    const progressColor = percentage < 25 ? "#DC3545" : percentage < 50 ? "#FD7E14" : percentage < 75 ? "#FFC107" : "#20C997"
    const progressBarClass = new ProgressBar.Circle(progressBar, {
        trailColor: "#aaa",
        strokeWidth: 12,
        trailWidth: 12,
        easing: 'easeInOut',
        duration: 1400,
        text: {
            autoStyleContainer: true
        },
        step: function(state, circle) {
            circle.path.setAttribute('stroke', state.color);
            circle.path.setAttribute('stroke-width', state.width);
            const value = Math.round(circle.value() * 100);
            circle.setText(`${value}`);
        }
    });
    progressBarClass.animate(percentage / 100, {
        from: { color: '#DC3545', width: 12 },
        to: { color: progressColor, width: 12 },
    });
}