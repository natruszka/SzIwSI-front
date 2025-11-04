const gestures = ['hand start', 'first digit touch', 'both start load phase', 'lift off', 'replace', 'both released']

async function randomizeAndPredictAsync() 
{
    signal = [Array.from({length: 32}).map(() => Array.from({length: 1024}).map(() =>Math.random() * 32000 - 8500))]
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

function signalToGesture(model_output)
{
    return gestures.filter((_, i) => model_output[i] === 1)
}