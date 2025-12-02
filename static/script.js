const gestures = ['hand start', 'first digit touch', 'both start load phase', 'lift off', 'replace', 'both released']

async function randomizeAndPredictAsync() 
{
    signal = [Array.from({length: 32}).map(() => Array.from({length: 1024}).map(() => Math.random() * 32000 - 8500))]
    await displayRandomNumbers();
    const response = await fetch("/predict",{
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ eeg: signal }),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const output = await response.json()

        const gestures = signalToGesture(output)

        const gesturePlaceholder = document.getElementById('gesture')
        gesturePlaceholder.innerHTML = gestures.length > 0 ? gestures.join(',') : 'no gesture'
}

async function displayRandomNumbers() {
    const elements = document.querySelectorAll('.eeg');

    elements.forEach(el => {
    let count = 0;
    const maxFlashes = 5;
    const intervalSpeed = 60;

    const interval = setInterval(() => {
        el.textContent = (Math.random() * 32000 - 8500).toFixed(0);
        count++;

        if (count >= maxFlashes) {
            clearInterval(interval);
        }
    }, intervalSpeed);
    });
}

function signalToGesture(model_output)
{
    return gestures.filter((_, i) => model_output[i] === 1)
}