// index.js - Adobe Premiere Pro UXP Plugin

function cleanAndFlattenTimeline() {
    const sequence = app.project.activeSequence;
    if (!sequence) {
        alert("No active sequence selected!");
        return;
    }

    const videoTracks = sequence.videoTracks;
    const audioTracks = sequence.audioTracks;

    // --- Helper: Remove effects and time remapping ---
    function stripClipEffects(clip) {
        try {
            const components = clip.components;
            if (components && components.numItems > 0) {
                for (let i = components.numItems - 1; i >= 0; i--) {
                    components[i].remove();
                }
            }
            // Reset speed
            if (clip.speed !== 100.0) {
                clip.speed = 100.0;
            }
        } catch (e) {
            // Skip if not applicable
        }
    }

    // --- Process all video tracks ---
    for (let t = 0; t < videoTracks.numTracks; t++) {
        const track = videoTracks[t];

        for (let c = track.clips.numItems - 1; c >= 0; c--) {
            const clip = track.clips[c];

            if (clip.isNestedSequence && clip.isNestedSequence()) {
                const nestedSeq = clip.projectItem.getSequence();
                if (!nestedSeq) continue;

                const insertTime = clip.start;

                for (let nt = 0; nt < nestedSeq.videoTracks.numTracks; nt++) {
                    const nestedTrack = nestedSeq.videoTracks[nt];
                    for (let nc = 0; nc < nestedTrack.clips.numItems; nc++) {
                        const nestedClip = nestedTrack.clips[nc];
                        if (!nestedClip.projectItem) continue;

                        track.insertClip(nestedClip.projectItem, insertTime.ticks);
                    }
                }
                clip.remove(0, 1); // Remove original nested clip
            } else {
                stripClipEffects(clip);
            }
        }
    }

    // --- Process all audio tracks ---
    for (let t = 0; t < audioTracks.numTracks; t++) {
        const track = audioTracks[t];

        for (let c = 0; c < track.clips.numItems; c++) {
            const clip = track.clips[c];
            stripClipEffects(clip);
        }
    }

    alert("Done! Timeline flattened and all effects removed.");
}

function flattenAndCleanCommand() {
    cleanAndFlattenTimeline();
}

module.exports = {
    commands: {
        flattenAndCleanCommand
    }
};
