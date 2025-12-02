import torch
from flask import Flask, jsonify, render_template, request
import torch.nn as nn

app = Flask(__name__)

class NNet(nn.Module):
    def __init__(self, in_channels=32, out_channels=6):
        super(NNet, self).__init__()
        self.hidden = 32
        self.net = nn.Sequential(
            nn.Conv1d(in_channels, in_channels, 5, padding=2),
            nn.Conv1d(self.hidden, self.hidden, 16, stride=16),
            nn.LeakyReLU(0.1),
            nn.Conv1d(self.hidden, self.hidden, 7, padding=3),
        )
        for i in range(6): # six different hand gestures
            self.net.add_module('conv{}'.format(i), \
                                self.__block(self.hidden, self.hidden))
        self.net.add_module('final', nn.Sequential(
            nn.Conv1d(self.hidden, out_channels, 1),
            nn.Sigmoid() # produces 1 or 0, depending on input
        ))
        
    def __block(self, inchannels, outchannels):
        return nn.Sequential(
            nn.MaxPool1d(2, 2),
            nn.Dropout(p=0.1, inplace=True),
            nn.Conv1d(inchannels, outchannels, 5, padding=2),
            nn.LeakyReLU(0.1),
            nn.Conv1d(outchannels, outchannels, 5, padding=2),
            nn.LeakyReLU(0.1), 
        )
    
    def forward(self, x):
        return self.net(x)
    
def load_model(model_path):
    model = NNet()
    model.load_state_dict(torch.load(model_path, map_location="cpu", weights_only=True))
    model.eval()  # Set the model to evaluation mode
    return model

MODEL_PATH = "model.pt"
model = load_model(MODEL_PATH)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/predict', methods = ['POST'])
def categories_post():
    data = request.get_json()
    x = torch.tensor(data["eeg"], dtype=torch.float32)  # convert to tensor

    outputs = model(x)
    output_tresholded = []
    for output in outputs:
        output_tresholded.append([float(a) for a in (output > 0.5).float()])
    return {'outputs': output_tresholded}
