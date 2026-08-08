/**
 * Data Structures & Algorithms Core Engine
 * Multi-Criteria Resource Dispatching & Proximity Optimization Engine
 */

// 1. Haversine Formula for exact geographic distance in Kilometers
function calculateHaversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in KM
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
      
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return parseFloat((R * c).toFixed(2)); // Distance in KM
}

// 2. Max Heap Priority Queue Implementation for Efficient K-Nearest Top Responders
class MaxHeap {
  constructor() {
    this.heap = [];
  }

  insert(element) {
    this.heap.push(element);
    this._bubbleUp(this.heap.length - 1);
  }

  extractMax() {
    if (this.heap.length === 0) return null;
    if (this.heap.length === 1) return this.heap.pop();

    const max = this.heap[0];
    this.heap[0] = this.heap.pop();
    this._sinkDown(0);
    return max;
  }

  isEmpty() {
    return this.heap.length === 0;
  }

  _bubbleUp(index) {
    while (index > 0) {
      const parentIndex = Math.floor((index - 1) / 2);
      if (this.heap[index].matchScore <= this.heap[parentIndex].matchScore) break;
      [this.heap[index], this.heap[parentIndex]] = [this.heap[parentIndex], this.heap[index]];
      index = parentIndex;
    }
  }

  _sinkDown(index) {
    const length = this.heap.length;
    while (true) {
      let leftIndex = 2 * index + 1;
      let rightIndex = 2 * index + 2;
      let largest = index;

      if (leftIndex < length && this.heap[leftIndex].matchScore > this.heap[largest].matchScore) {
        largest = leftIndex;
      }
      if (rightIndex < length && this.heap[rightIndex].matchScore > this.heap[largest].matchScore) {
        largest = rightIndex;
      }
      if (largest === index) break;

      [this.heap[index], this.heap[largest]] = [this.heap[largest], this.heap[index]];
      index = largest;
    }
  }
}

/**
 * Calculates optimal responder dispatches for an incident
 * @param {Object} incident - Incident object with location [lng, lat] and urgencyScore
 * @param {Array} availableVolunteers - Array of available User objects
 * @param {Number} topK - Number of responders needed (default 3)
 */
function findOptimalResponders(incident, availableVolunteers, topK = 3) {
  const [incLng, incLat] = incident.location.coordinates;
  const maxHeap = new MaxHeap();

  for (const volunteer of availableVolunteers) {
    const [volLng, volLat] = volunteer.location.coordinates;
    const distanceKm = calculateHaversineDistance(incLat, incLng, volLat, volLng);

    // Skip volunteers beyond max dispatch radius (e.g. 50km)
    if (distanceKm > 50) continue;

    // Check skill overlap (e.g. Flood needs 'Boat Rescue' or 'First Aid')
    let skillBonus = 0;
    if (incident.aiTriage && incident.aiTriage.extractedNeeds) {
      const matchingSkills = volunteer.skills.filter(s =>
        incident.aiTriage.extractedNeeds.some(need => need.toLowerCase().includes(s.toLowerCase()))
      );
      skillBonus = matchingSkills.length * 15;
    }

    // Multi-Criteria Weighted Match Score Formula
    // MatchScore = (Urgency * 10) - (Distance * 3) + SkillBonus + (Rating * 5)
    const matchScore = parseFloat(
      (
        incident.urgencyScore * 10 -
        distanceKm * 3.5 +
        skillBonus +
        (volunteer.rating || 4.5) * 5
      ).toFixed(2)
    );

    maxHeap.insert({
      responder: volunteer,
      distanceKm,
      matchScore
    });
  }

  // Extract Top K matches from Max-Heap
  const topMatches = [];
  while (!maxHeap.isEmpty() && topMatches.length < topK) {
    topMatches.push(maxHeap.extractMax());
  }

  return topMatches;
}

module.exports = {
  calculateHaversineDistance,
  MaxHeap,
  findOptimalResponders
};
