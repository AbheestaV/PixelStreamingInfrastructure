import { test, expect } from '@playwright/test';
import * as path from 'path';

function delay(time: number) {
  return new Promise(function(resolve) { 
    setTimeout(resolve, time)
  });
}

async function waitForVideo(page: Page) {
    await page.evaluate(()=> {
        return new Promise((resolve) => {
            pixelStreaming.addEventListener('playStream', (event) => {
                return resolve(event);
            });
        });
    });
}

// just quickly test that the default stream is working
test('Test default stream.', async ({ page }, testinfo) => {

    // set a long timeout to allow for slow software rendering
    test.setTimeout(2 * 60 * 1000);
    
    await page.goto("/?StreamerId=DefaultStreamer");
    await page.getByText('Click to start').click();

    // wait until we get a stream
    await waitForVideo(page);

    // let the stream run for a small duration
    await delay(30000);

    // query the frontend for its calculated stats
    const frame_count:number = await page.evaluate(()=> {
        let videoStats = pixelStreaming._webRtcController.peerConnectionController.aggregatedStats.inboundVideoStats;
        return videoStats.framesReceived;
    });

    // take a screenshot for posterity
    const __dirname = path.dirname(__filename);
    const screenshot = await page.screenshot({
        path: path.join(__dirname, '..', 'StreamResult.png'),
        fullPage: false
    });
    testinfo.attach('screenshot', { body: screenshot, contentType: 'image/png' });

    // pass the test if we recorded any frames
    expect(frame_count).toBeGreaterThan(0);
});

