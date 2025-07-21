import historyAvatar from '../../assets/history.png';
import biologyAvatar from '../../assets/biology.png';
import socialAvatar from '../../assets/social.png';
import chemistryAvatar from '../../assets/chemistry.png';
import snorlaxAvatar from '/snorlax.png';
import defaultAvatar from '../../assets/eddy.png';

export const characters = [
  {
    id: 4,
    name: 'Mickey',
    image: historyAvatar,
    type: 'History',
  },
  {
    id: 5,
    name: 'Sherlock',
    image: socialAvatar,
    type: 'Social Studies',
  },
  {
    id: 1,
    name: 'Eddy',
    image: defaultAvatar,
    type: 'General',
  },
  {
    id: 2,
    name: 'Winne the Pooh',
    image: biologyAvatar,
    type: 'Biology',
  },
  {
    id: 5,
    name: 'Maya',
    image: chemistryAvatar,
    type: 'Chemistry',
  },
  {
    id: 3,
    name: 'Future',
    image: snorlaxAvatar,
    type: 'Coming soon..',
  },
];
