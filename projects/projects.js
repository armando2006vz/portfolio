import { fetchJSON, renderProjects } from '../global.js';
import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm';


const projects = await fetchJSON('../lib/projects.json');


const projectsContainer = document.querySelector('.projects');


renderProjects(projects, projectsContainer, 'h2');

document.querySelector('.projects-title').textContent = `Projects (${projects.length})`;

let selectedIndex = -1;

function renderPieChart(projectsGiven) {

  let arcGenerator = d3.arc().innerRadius(0).outerRadius(50);

let rolledData = d3.rollups(
  projectsGiven,
  (v) => v.length,
  (d) => d.year,
);

let data = rolledData.map(([year, count]) => {
  return { value: count, label: year };
});

let sliceGenerator = d3.pie().value((d) => d.value);

let arcData = sliceGenerator(data);
let arcs = arcData.map((d) => arcGenerator(d));

let colors = d3.scaleOrdinal(d3.schemeTableau10);

let newSVG = d3.select('svg');
newSVG.selectAll('path').remove();

arcs.forEach((arc, index) => {
  d3.select('svg')
    .append('path')
    .attr('d', arc)
    .attr('fill', colors(index))
    .on('click', () => {
      selectedIndex = selectedIndex === index ? -1 : index;
    newSVG
  .selectAll('path')
  .attr('class', (_, idx) => (
    idx === selectedIndex ? 'selected' : ''
  ));
  legend.selectAll('li')
  .attr('class', (_, idx) => (
    idx === selectedIndex ? 'legend-item selected' : 'legend-item'
  ));
  if (selectedIndex === -1) {
    renderProjects(projects, projectsContainer, 'h2');
  } else {
    let selectedYear = data[selectedIndex].label;
    let filteredProjects = projects.filter((project) => project.year === selectedYear);
    renderProjects(filteredProjects, projectsContainer, 'h2');
  }
});
});

let legend = d3.select('.legend');
legend.selectAll('li').remove();
data.forEach((d, idx) => {
  legend
    .append('li')
    .attr('style', `--color:${colors(idx)}`) // set the style attribute while passing in parameters
    .attr('class', 'legend-item')
    .html(`<span class="swatch"></span> ${d.label} <em>(${d.value})</em>`); // set the inner html of <li>
});
}
renderPieChart(projects);


let query = '';
let searchInput = document.querySelector('.searchBar');
searchInput.addEventListener('input', (event) => {
  // update query value
  query = event.target.value;
  // filter projects
  let filteredProjects = projects.filter((project) => {
    let values = Object.values(project).join('\n').toLowerCase();
    return values.includes(query.toLowerCase());
  });
  // render filtered projects
  renderProjects(filteredProjects, projectsContainer, 'h2');
  renderPieChart(filteredProjects);

});



// This issue is that the search bar and pie chart update the projects list independently,
//  both using original prject array so when we click on a pie chart slice after searching, 
// it will show all projects for that year and ignores the search query. 
// To fix this we can create a shared filterProjects function  that applies both the search query 
// and the pie chart selection to filter the projects list. This way, both the search bar and 
// pie chart will work together to display the correct filtered 
// projects.