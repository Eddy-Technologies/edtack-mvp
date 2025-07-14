import historyAvatar from '../../assets/history.png';
import biologyAvatar from '../../assets/biology.png';
import socialAvatar from '../../assets/social.png';
import chemistryAvatar from '../../assets/chemistry.png';
import snorlaxAvatar from '/snorlax.png';
import defaultAvatar from '../../assets/eddy.png';

export const characters = [
  {
    id: 1,
    name: 'Mickey',
    image: historyAvatar,
    type: 'History',
  },
  {
    id: 2,
    name: 'Sherlock',
    image: socialAvatar,
    type: 'Social Studies',
  },
  {
    id: 3,
    name: 'Eddy',
    image: defaultAvatar,
    type: 'General',
  },
  {
    id: 4,
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
    id: 6,
    name: 'Future',
    image: snorlaxAvatar,
    type: 'Coming soon..',
  },
];
