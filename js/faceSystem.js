$(document).ready(function(){

    const img = document.createElement('img');
    const canvas = document.createElement('canvas');
    const button = document.createElement('button');
    const intro = document.querySelector('.intro');


    img.setAttribute("src","images/kanye2.jpg");
    img.setAttribute("width","800");

    canvas.setAttribute("id","reflay");
    canvas.setAttribute("class","overlay");

    button.setAttribute("id","detectBtn");
    button.innerText = 'Detectar';
                
    async function face(){
        
        const MODEL_URL = './models';

        await faceapi.loadSsdMobilenetv1Model(MODEL_URL);
        await faceapi.loadFaceLandmarkModel(MODEL_URL);
        await faceapi.loadFaceRecognitionModel(MODEL_URL);
        await faceapi.loadFaceExpressionModel(MODEL_URL);

        let faceDescriptions = await faceapi.detectAllFaces(img).withFaceLandmarks().withFaceDescriptors().withFaceExpressions();
        faceapi.matchDimensions(canvas, img);

        document.querySelector('body').removeChild(intro);
        document.querySelector('body').appendChild(img);
        document.querySelector('body').appendChild(canvas);
        document.querySelector('body').appendChild(button);

        setTimeout(()=>{

            faceDescriptions = faceapi.resizeResults(faceDescriptions, img);
            faceapi.draw.drawDetections(canvas, faceDescriptions);
            faceapi.draw.drawFaceLandmarks(canvas, faceDescriptions);
            faceapi.draw.drawFaceExpressions(canvas, faceDescriptions);

        }, 1000);
        
        const labels = ['ross', 'rachel', 'chandler', 'monica', 'phoebe', 'kanye', 'joey'];

        const labeledFaceDescriptors = await Promise.all(

            labels.map(async label => {

                const imgUrl = `images/${label}.jpg`;
                const img = await faceapi.fetchImage(imgUrl);
                
                const faceDescription = await faceapi.detectSingleFace(img).withFaceLandmarks().withFaceDescriptor();
                
                if (!faceDescription) {

                   throw new Error(`no faces detected for ${label}`);

                }
                
                const faceDescriptors = [faceDescription.descriptor];
                return new faceapi.LabeledFaceDescriptors(label, faceDescriptors);
            })
        );

        const threshold = 0.5;
        const faceMatcher = new faceapi.FaceMatcher(labeledFaceDescriptors, threshold);

       
        button.addEventListener("click", ()=>{

            const results = faceDescriptions.map(fd => faceMatcher.findBestMatch(fd.descriptor));

            results.forEach((bestMatch, i) => {
                const box = faceDescriptions[i].detection.box;
                const text = bestMatch.toString();
                const drawBox = new faceapi.draw.DrawBox(box, { label: text });
                drawBox.draw(canvas);
            })
            
        })

        

    }
    
    face();
})
