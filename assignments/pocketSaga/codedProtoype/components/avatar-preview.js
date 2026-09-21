/* Preview consumes the shared avatar renderer; no local design definitions. */
(() => {
  const list = document.querySelector('.avatars');
  pocketSagaData.people.forEach(person => {
    const variant = PocketSagaAvatars.get(person);
    const item = document.createElement('li');
    const portrait = document.createElement('div');
    portrait.className = 'portrait';
    portrait.setAttribute('role', 'img');
    portrait.setAttribute('aria-label', `${person.name}'s ${variant.description.toLowerCase()} avatar`);
    portrait.innerHTML = PocketSagaAvatars.render(person);
    const name = document.createElement('h2');
    name.textContent = person.name;
    const description = document.createElement('p');
    description.className = 'description';
    description.textContent = variant.description;
    const samples = document.createElement('div');
    samples.className = 'sizes';
    samples.setAttribute('aria-hidden', 'true');
    [48, 32, 24].forEach(size => {
      const sample = document.createElement('div');
      sample.className = 'sample';
      sample.style.width = sample.style.height = `${size}px`;
      sample.innerHTML = PocketSagaAvatars.render(person);
      samples.append(sample);
    });
    item.append(portrait, name, description, samples);
    list.append(item);
  });
})();
