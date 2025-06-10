async function getSBahnTrips(stationId) {
    const req = await fetch(`https://v6.vbb.transport.rest/stops/${stationId}/departures?results=10&duration=20&tram=false&bus=false&ferry=false`);
    if (!req.ok) {
        throw new Error(`Error fetching data: ${req.statusText}`);
    }
    const data = await req.json();
    if (data.departures){
        return data.departures.map(trip => ({
            id: trip.tripId,
            destination: trip.destination.name,
            plannedWhen: trip.plannedWhen,
            when: trip.when || null,
            platform: trip.platform,
            delay: trip.delay,
            vehicle: trip.line.name,
            line: trip.line.product,
            direction: trip.direction
        }));
    }
}

function isStillOnTime(plannedWhen, when){
    if (!when) return "Cancelled";
    const plannedDate = new Date(plannedWhen);
    const actualDate = new Date(when);
    return actualDate <= plannedDate
}

function updateTrips(_trips) {
    const trips = _trips.slice(0, 5)
    const tripContainer = document.getElementById('trips');
    const existingTrips = Array.from(tripContainer.children).map(child => child.dataset.tripId);
    const newTrips = trips.filter(trip => !existingTrips.includes(trip.id));
    newTrips.forEach(trip => {
        const tripElement = document.createElement('div');
        tripElement.className = 'trip-container';
        tripElement.dataset.tripId = trip.id;
        tripElement.dataset.plannedWhen = trip.plannedWhen;
        tripElement.dataset.when = trip.when || '';
        console.log(tripElement.dataset)
        tripElement.innerHTML = `
            <span class="trip-vehicle">${trip.vehicle}</span>
            <span class="trip-destination">${trip.destination}</span>
            <div class="trip-details">
            <span class="trip-time">
                🕒 ${new Date(trip.plannedWhen).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}
            </span>
            ${
                trip.actualDeparture
                ? `<span class="trip-time">
                    ${(trip.delay && trip.when) ? `⏱️ ${new Date(trip.when).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })} (${trip.delay} min delay)` : `⏱️ ${new Date(trip.when).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}`}
                    </span>`
                : ''
            }
            </div>
        `;

        tripContainer.appendChild(tripElement);
    });
    //remove trips that are not in new trips
    const tripIds = new Set(trips.map(trip => trip.id));
    Array.from(tripContainer.children).forEach(child => {
        if (!tripIds.has(child.dataset.tripId)) {
            tripContainer.removeChild(child);
        } else {
            // Update existing trip details
            const trip = trips.find(t => t.id === child.dataset.tripId);
            child.querySelector('.trip-vehicle').innerText = trip.vehicle;
            child.querySelector('.trip-destination').innerText = trip.destination;
            child.querySelector('.trip-time').innerText = `🕒 ${new Date(trip.plannedWhen).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}`;
            if (trip.when && trip.delay) {
                child.querySelector('.trip-time').innerText += ` ⏱️ ${new Date(trip.when).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })} (${trip.delay}s delay)`;
            }
        }
    });
    // Sort trips by planned time
    const sortedTrips = Array.from(tripContainer.children).sort((a, b) => {
        const aTime = new Date(a.dataset.plannedWhen);
        const bTime = new Date(b.dataset.plannedWhen);
        return aTime - bTime;
    }
    );
    // Clear the container and append sorted trips
    tripContainer.innerHTML = '';
    sortedTrips.slice(0,5).forEach(trip => {
        tripContainer.appendChild(trip);
    });
    // Update the trip error message
    if (trips.length === 0) {
        // document.getElementById('tripError').innerText = 'No trips available';
    }
    else {
        // document.getElementById('tripError').innerText = '';
    }
    // Update the trip count
    // document.getElementById('tripCount').innerText = `Trips: ${trips.length}`;

}

async function main(){
    const trips = await getSBahnTrips('900171003');
    updateTrips(trips);
    setInterval(() => {
        getSBahnTrips('900171003').then(newTrips => {
            if (!newTrips || newTrips.length === 0) {
                document.getElementById('tripError').innerText = 'No trips available';
                return;
            }
            updateTrips(newTrips);
            document.getElementById('tripError').innerText = '';
        }).catch(error => {
            document.getElementById('tripError').innerText = 'Error fetching new trips';
            console.error('Error fetching new trips:', error);
        });
    }, 20000);
}


main()
document.querySelectorAll('[data-ieee]').forEach(element => {
    
})
document.querySelectorAll('[data-state-url]').forEach(element => {
    fetch(element.dataset.stateUrl).then(response => response.json()).then(data => {
        element.dataset.state = data.state == "OFF" ? false : true;
    })
    element.addEventListener('click', async(event) => {
        const [state, on, off] = [element.dataset.state, element.dataset.urlOn, element.dataset.urlOff];
        console.log(state)
        await fetch(state === "true" ? off : on);
        element.dataset.state = state === "false" ? "true" : "false";
    });
});
