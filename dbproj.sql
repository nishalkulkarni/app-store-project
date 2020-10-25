CREATE TABLE users (
    user_id CHAR(6) PRIMARY KEY,
    email varchar(50) NOT NULL UNIQUE,
    password varchar(50) NOT NULL,
    address varchar(100) NOT NULL
);
CREATE TABLE devices (
    device_id CHAR(6) PRIMARY KEY,
    user_id CHAR(6),
    os VARCHAR(20) NOT NULL,
    CONSTRAINT fk_device_user foreign key (user_id) references users(user_id)
);
CREATE TABLE developer (
    dev_id CHAR(6) PRIMARY KEY,
    dev_email VARCHAR(50) NOT NULL UNIQUE,
    dev_password VARCHAR(50) NOT NULL,
    dev_name VARCHAR(50) NOT NULL
);
CREATE TABLE app (
    app_id CHAR(6) PRIMARY KEY,
    dev_id CHAR(6),
    app_name VARCHAR(50) NOT NULL,
    description VARCHAR(100) NULL,
    cost FLOAT(10, 2) NOT NULL,
    payment_link VARCHAR(100) NULL,
    date_of_publishing DATE NOT NULL,
    last_updated DATE NOT NULL,
    version_1_link VARCHAR(100) NOT NULL,
    version_2_link VARCHAR(100) NOT NULL,
    version_3_link VARCHAR(100) NULL,
    CONSTRAINT fk_app_dev foreign key (dev_id) references developer(dev_id)
);
CREATE TABLE supported_platforms (
    app_id CHAR(6),
    os VARCHAR(20),
    CONSTRAINT pk_app_os primary key (app_id, os),
    CONSTRAINT fk_app_platform foreign key (app_id) references app(app_id)
);
CREATE TABLE transaction (
    user_id CHAR(6),
    app_id CHAR(6),
    device_id CHAR(6),
    version_link VARCHAR(50) NOT NULL,
    installed CHAR(3) NOT NULL,
    CONSTRAINT pk_user_app_device primary key (user_id, app_id, device_id),
    CONSTRAINT fk_transaction_user foreign key (user_id) references users(user_id),
    CONSTRAINT fk_transaction_app foreign key (app_id) references app(app_id),
    CONSTRAINT fk_transaction_device foreign key (device_id) references devices(device_id),
    CONSTRAINT check_if_installed CHECK(installed IN ('YES', 'NO'))
);
CREATE TABLE feedback (
    user_id CHAR(6),
    app_id CHAR(6),
    rating INT(5) NULL,
    review VARCHAR(100) NULL,
    CONSTRAINT pk_user_app_feedback primary key (user_id, app_id),
    CONSTRAINT fk_feedback_user foreign key (user_id) references users(user_id),
    CONSTRAINT fk_feedback_app foreign key (app_id) references app(app_id)
);
insert into users (user_id, email, password, address)
values (
        'U12537',
        'vkik0@china.com.cn',
        'rIFLgDAI',
        '290 Esker Alley'
    );
insert into users (user_id, email, password, address)
values (
        'U14931',
        'ocanfield1@newsvine.com',
        'HHehhu5dIa1H',
        '3 Marquette Trail'
    );
insert into users (user_id, email, password, address)
values (
        'U13074',
        'pmallia2@mysql.com',
        'FRqEM9R1',
        '251 Lukken Place'
    );
insert into users (user_id, email, password, address)
values (
        'U17367',
        'blerhinan3@ycombinator.com',
        'VJukiy1XgGF',
        '71926 Sachs Center'
    );
insert into users (user_id, email, password, address)
values (
        'U12009',
        'ooldknowe4@github.io',
        'CH6lpwnFjNk3',
        '0324 Gateway Place'
    );
insert into users (user_id, email, password, address)
values (
        'U18048',
        'belliston5@digg.com',
        'HJS73nuX',
        '86254 Butternut Terrace'
    );
insert into users (user_id, email, password, address)
values (
        'U19237',
        'jrattenbury6@parallels.com',
        'vyCUOdgBAvg',
        '7 Lindbergh Drive'
    );
insert into users (user_id, email, password, address)
values (
        'U14301',
        'spic7@huffingtonpost.com',
        'OO2QfOs',
        '4 Katie Crossing'
    );
insert into users (user_id, email, password, address)
values (
        'U10476',
        'hwitnall8@eepurl.com',
        'ojprTZBZT',
        '470 Ronald Regan Road'
    );
insert into users (user_id, email, password, address)
values (
        'U11363',
        'estirtle9@hc360.com',
        '48WfjMn8KH',
        '4231 Golf Course Road'
    );
insert into devices (device_id, user_id, os)
values ('D12064', 'U12537', 'IOS');
insert into devices (device_id, user_id, os)
values ('D11425', 'U14931', 'MAC');
insert into devices (device_id, user_id, os)
values ('D15569', 'U19237', 'Windows');
insert into devices (device_id, user_id, os)
values ('D16993', 'U14301', 'Linux');
insert into devices (device_id, user_id, os)
values ('D11401', 'U10476', 'MAC');
insert into devices (device_id, user_id, os)
values ('D17236', 'U11363', 'Windows');
insert into devices (device_id, user_id, os)
values ('D11245', 'U12537', 'MAC');
insert into devices (device_id, user_id, os)
values ('D15284', 'U14931', 'Linux');
insert into devices (device_id, user_id, os)
values ('D10578', 'U13074', 'Linux');
insert into devices (device_id, user_id, os)
values ('D12415', 'U17367', 'IOS');
insert into devices (device_id, user_id, os)
values ('D13846', 'U12009', 'Android');
insert into devices (device_id, user_id, os)
values ('D10720', 'U13074', 'Linux');
insert into devices (device_id, user_id, os)
values ('D19245', 'U17367', 'MAC');
insert into devices (device_id, user_id, os)
values ('D11612', 'U12009', 'Android');
insert into devices (device_id, user_id, os)
values ('D13541', 'U18048', 'Android');
insert into developer (dev_id, dev_email, dev_password, dev_name)
values (
        'DEV188',
        'drobinett0@Wordtune.gov',
        'zLToFDps4Ps',
        'Wordtune'
    );
insert into developer (dev_id, dev_email, dev_password, dev_name)
values (
        'DEV101',
        'elebrom1@Feedspan.com',
        'xAux1BUS',
        'Feedspan'
    );
insert into developer (dev_id, dev_email, dev_password, dev_name)
values (
        'DEV164',
        'lwychard2@Babbleset.tv',
        'u32bECqmC3',
        'Babbleset'
    );
insert into developer (dev_id, dev_email, dev_password, dev_name)
values (
        'DEV117',
        'mmorten3@Bluejam.com',
        'VksMPzVu6AO3',
        'Bluejam'
    );
insert into developer (dev_id, dev_email, dev_password, dev_name)
values (
        'DEV167',
        'vcross4@Trunyx.org',
        '1PNT157Wk',
        'Trunyx'
    );
insert into developer (dev_id, dev_email, dev_password, dev_name)
values (
        'DEV193',
        'lkilsby5@Buzzster.net',
        'uqi7dg',
        'Buzzster'
    );
insert into app (
        app_id,
        dev_id,
        app_name,
        description,
        cost,
        payment_link,
        date_of_publishing,
        last_updated,
        version_1_link,
        version_2_link,
        version_3_link
    )
values (
        'app155',
        'DEV188',
        'Alphazap',
        'VPN',
        2.5,
        'http://illinois.edu/interdum.jpg',
        STR_TO_DATE('21-Mar-2018', '%d-%M-%Y'),
        STR_TO_DATE('08-Dec-2019', '%d-%M-%Y'),
        'http://dropbox.com/volutpat/in/congue/etiam/justo.js',
        'https://unc.edu/duis/ac/nibh/fusce.js',
        'http://forbes.com/luctus/cum/sociis/natoque/penatibus/et.aspx'
    );
insert into app (
        app_id,
        dev_id,
        app_name,
        description,
        cost,
        payment_link,
        date_of_publishing,
        last_updated,
        version_1_link,
        version_2_link,
        version_3_link
    )
values (
        'app200',
        'DEV101',
        'Tin',
        'Gambling',
        2.5,
        'https://fema.gov/congue/elementum/in.json',
        STR_TO_DATE('25-Dec-2018', '%d-%M-%Y'),
        STR_TO_DATE('24-Apr-2020', '%d-%M-%Y'),
        'http://shareasale.com/proin/leo.jpg',
        'http://jimdo.com/cubilia/curae/mauris/viverra/diam/vitae.png',
        'https://answers.com/sapien/non/mi/integer.js'
    );
insert into app (
        app_id,
        dev_id,
        app_name,
        description,
        cost,
        payment_link,
        date_of_publishing,
        last_updated,
        version_1_link,
        version_2_link,
        version_3_link
    )
values (
        'app191',
        'DEV164',
        'Lotlux',
        'To-Do',
        15.54,
        'https://drupal.org/quam.aspx',
        STR_TO_DATE('16-Aug-2016', '%d-%M-%Y'),
        STR_TO_DATE('25-Jan-2020', '%d-%M-%Y'),
        'http://google.cn/viverra.js',
        'https://yandex.ru/eu/massa/donec/dapibus.html',
        'https://cbc.ca/cum/sociis.jsp'
    );
insert into app (
        app_id,
        dev_id,
        app_name,
        description,
        cost,
        payment_link,
        date_of_publishing,
        last_updated,
        version_1_link,
        version_2_link,
        version_3_link
    )
values (
        'app113',
        'DEV117',
        'Toughjoyfax',
        'Fitness app',
        4.99,
        'https://simplemachines.org/in/hac/habitasse.png',
        STR_TO_DATE('14-Aug-2019', '%d-%M-%Y'),
        STR_TO_DATE('10-Dec-2019', '%d-%M-%Y'),
        'http://deviantart.com/nec.js',
        'https://nhs.uk/lectus/vestibulum/quam/sapien/varius.xml',
        'https://seesaa.net/luctus.xml'
    );
insert into app (
        app_id,
        dev_id,
        app_name,
        description,
        cost,
        payment_link,
        date_of_publishing,
        last_updated,
        version_1_link,
        version_2_link,
        version_3_link
    )
values (
        'app149',
        'DEV167',
        'Stringtough',
        'Productivity',
        2.5,
        'http://dion.ne.jp/vestibulum/sed/magna/at/nunc/commodo/placerat.html',
        STR_TO_DATE('21-Feb-2018', '%d-%M-%Y'),
        STR_TO_DATE('11-Dec-2019', '%d-%M-%Y'),
        'https://unesco.org/quam/turpis/adipiscing/lorem/vitae/mattis/nibh.png',
        'https://washingtonpost.com/amet/justo/morbi/ut/odio/cras.jsp',
        'http://xing.com/lobortis.jpg'
    );
insert into app (
        app_id,
        dev_id,
        app_name,
        description,
        cost,
        payment_link,
        date_of_publishing,
        last_updated,
        version_1_link,
        version_2_link,
        version_3_link
    )
values (
        'app126',
        'DEV193',
        'Trippledex',
        'Productivity',
        0,
        'http://privacy.gov.au/nunc/commodo/placerat/praesent/blandit.png',
        STR_TO_DATE('05-Apr-2017', '%d-%M-%Y'),
        STR_TO_DATE('06-Jul-2020', '%d-%M-%Y'),
        'http://fema.gov/nulla/suspendisse/potenti/cras/in/purus/eu.xml',
        'http://woothemes.com/praesent/blandit/nam/nulla/integer/pede/justo.jsp',
        'https://weibo.com/nam.json'
    );
insert into app (
        app_id,
        dev_id,
        app_name,
        description,
        cost,
        payment_link,
        date_of_publishing,
        last_updated,
        version_1_link,
        version_2_link,
        version_3_link
    )
values (
        'app177',
        'DEV101',
        'Temp',
        'Productivity',
        0,
        'https://nyu.edu/dapibus/dolor/vel/est/donec.json',
        STR_TO_DATE('21-Aug-2016', '%d-%M-%Y'),
        STR_TO_DATE('28-Dec-2019', '%d-%M-%Y'),
        'http://washington.edu/massa/id/nisl/venenatis.png',
        'https://who.int/cursus/id/turpis/integer/aliquet/massa/id.jsp',
        'https://acquirethisname.com/morbi/non/quam/nec.xml'
    );
insert into app (
        app_id,
        dev_id,
        app_name,
        description,
        cost,
        payment_link,
        date_of_publishing,
        last_updated,
        version_1_link,
        version_2_link,
        version_3_link
    )
values (
        'app199',
        'DEV164',
        'Sonsing',
        'Productivity',
        15.54,
        'https://wikipedia.org/sed/augue/aliquam/erat/volutpat/in.jpg',
        STR_TO_DATE('26-Apr-2016', '%d-%M-%Y'),
        STR_TO_DATE('28-Jun-2020', '%d-%M-%Y'),
        'http://google.fr/consectetuer/adipiscing.jpg',
        'http://constantcontact.com/amet/lobortis.html',
        'https://spotify.com/eget/eros/elementum/pellentesque/quisque/porta.aspx'
    );
insert into app (
        app_id,
        dev_id,
        app_name,
        description,
        cost,
        payment_link,
        date_of_publishing,
        last_updated,
        version_1_link,
        version_2_link,
        version_3_link
    )
values (
        'app162',
        'DEV117',
        'Bitchip',
        'Game',
        4.99,
        'http://cdbaby.com/pede/justo/eu/massa/donec.html',
        STR_TO_DATE('26-Jan-2019', '%d-%M-%Y'),
        STR_TO_DATE('09-Feb-2020', '%d-%M-%Y'),
        'http://skyrock.com/non.html',
        'https://mozilla.com/congue/eget.json',
        'http://sfgate.com/dui/vel/nisl/duis/ac/nibh.jsp'
    );
insert into app (
        app_id,
        dev_id,
        app_name,
        description,
        cost,
        payment_link,
        date_of_publishing,
        last_updated,
        version_1_link,
        version_2_link,
        version_3_link
    )
values (
        'app181',
        'DEV188',
        'Tempsoft',
        'Productivity',
        4.99,
        'http://intel.com/aliquet.html',
        STR_TO_DATE('15-Nov-2017', '%d-%M-%Y'),
        STR_TO_DATE('28-Dec-2019', '%d-%M-%Y'),
        'https://go.com/praesent/lectus.jpg',
        'http://pcworld.com/nascetur/ridiculus/mus.jsp',
        'https://simplemachines.org/porta/volutpat/erat/quisque/erat.xml'
    );
insert into supported_platforms (app_id, os)
values ('app200', 'MAC');
insert into supported_platforms (app_id, os)
values ('app191', 'IOS');
insert into supported_platforms (app_id, os)
values ('app113', 'IOS');
insert into supported_platforms (app_id, os)
values ('app149', 'Linux');
insert into supported_platforms (app_id, os)
values ('app126', 'Android');
insert into supported_platforms (app_id, os)
values ('app177', 'Android');
insert into supported_platforms (app_id, os)
values ('app199', 'IOS');
insert into supported_platforms (app_id, os)
values ('app162', 'MAC');
insert into supported_platforms (app_id, os)
values ('app181', 'Android');
insert into supported_platforms (app_id, os)
values ('app155', 'IOS');
insert into supported_platforms (app_id, os)
values ('app200', 'IOS');
insert into supported_platforms (app_id, os)
values ('app191', 'Android');
insert into supported_platforms (app_id, os)
values ('app113', 'MAC');
insert into supported_platforms (app_id, os)
values ('app149', 'Android');
insert into supported_platforms (app_id, os)
values ('app126', 'MAC');
insert into supported_platforms (app_id, os)
values ('app177', 'Windows');
insert into supported_platforms (app_id, os)
values ('app199', 'MAC');
insert into supported_platforms (app_id, os)
values ('app162', 'Android');
insert into supported_platforms (app_id, os)
values ('app181', 'IOS');
insert into transaction (
        user_id,
        app_id,
        device_id,
        version_link,
        installed
    )
values (
        'U12537',
        'app155',
        'D12064',
        'http://dummyversion.com/139x228.png/cc0000',
        'YES'
    );
insert into transaction (
        user_id,
        app_id,
        device_id,
        version_link,
        installed
    )
values (
        'U14931',
        'app200',
        'D11425',
        'http://dummyversion.com/243x143.jpg/cc0000',
        'NO'
    );
insert into transaction (
        user_id,
        app_id,
        device_id,
        version_link,
        installed
    )
values (
        'U13074',
        'app191',
        'D10578',
        'http://dummyversion.com/175x216.jpg/ff4444',
        'NO'
    );
insert into transaction (
        user_id,
        app_id,
        device_id,
        version_link,
        installed
    )
values (
        'U17367',
        'app113',
        'D12415',
        'http://dummyversion.com/222x149.jpg/cc0000',
        'NO'
    );
insert into transaction (
        user_id,
        app_id,
        device_id,
        version_link,
        installed
    )
values (
        'U12009',
        'app149',
        'D13846',
        'http://dummyversion.com/238x148.bmp/5fa2dd',
        'NO'
    );
insert into transaction (
        user_id,
        app_id,
        device_id,
        version_link,
        installed
    )
values (
        'U19237',
        'app177',
        'D15569',
        'http://dummyversion.com/111x227.jpg/5fa2dd',
        'YES'
    );
insert into transaction (
        user_id,
        app_id,
        device_id,
        version_link,
        installed
    )
values (
        'U14301',
        'app199',
        'D16993',
        'http://dummyversion.com/208x180.png/5fa2dd',
        'YES'
    );
insert into transaction (
        user_id,
        app_id,
        device_id,
        version_link,
        installed
    )
values (
        'U10476',
        'app162',
        'D11401',
        'http://dummyversion.com/235x240.bmp/cc0000',
        'YES'
    );
insert into transaction (
        user_id,
        app_id,
        device_id,
        version_link,
        installed
    )
values (
        'U18048',
        'app149',
        'D13541',
        'http://dummyversion.com/142x105.jpg/cc0000',
        'NO'
    );
insert into transaction (
        user_id,
        app_id,
        device_id,
        version_link,
        installed
    )
values (
        'U19237',
        'app126',
        'D15569',
        'http://dummyversion.com/186x126.bmp/dddddd',
        'NO'
    );
insert into transaction (
        user_id,
        app_id,
        device_id,
        version_link,
        installed
    )
values (
        'U14301',
        'app200',
        'D16993',
        'http://dummyversion.com/215x104.jpg/5fa2dd',
        'NO'
    );
insert into transaction (
        user_id,
        app_id,
        device_id,
        version_link,
        installed
    )
values (
        'U11363',
        'app177',
        'D17236',
        'http://dummyversion.com/246x102.bmp/cc0000',
        'YES'
    );
insert into transaction (
        user_id,
        app_id,
        device_id,
        version_link,
        installed
    )
values (
        'U12537',
        'app191',
        'D12064',
        'http://dummyversion.com/130x211.jpg/5fa2dd',
        'YES'
    );
insert into transaction (
        user_id,
        app_id,
        device_id,
        version_link,
        installed
    )
values (
        'U14931',
        'app113',
        'D15284',
        'http://dummyversion.com/147x108.png/cc0000',
        'YES'
    );
insert into transaction (
        user_id,
        app_id,
        device_id,
        version_link,
        installed
    )
values (
        'U13074',
        'app149',
        'D10720',
        'http://dummyversion.com/118x115.jpg/5fa2dd',
        'YES'
    );
insert into transaction (
        user_id,
        app_id,
        device_id,
        version_link,
        installed
    )
values (
        'U17367',
        'app155',
        'D19245',
        'http://dummyversion.com/189x195.jpg/5fa2dd',
        'NO'
    );
insert into transaction (
        user_id,
        app_id,
        device_id,
        version_link,
        installed
    )
values (
        'U12009',
        'app200',
        'D11612',
        'http://dummyversion.com/182x177.bmp/ff4444',
        'NO'
    );
insert into transaction (
        user_id,
        app_id,
        device_id,
        version_link,
        installed
    )
values (
        'U18048',
        'app126',
        'D13541',
        'http://dummyversion.com/185x185.bmp/cc0000',
        'YES'
    );
insert into transaction (
        user_id,
        app_id,
        device_id,
        version_link,
        installed
    )
values (
        'U11363',
        'app181',
        'D17236',
        'http://dummyversion.com/237x103.png/5fa2dd',
        'YES'
    );
insert into feedback (user_id, app_id, rating, review)
values ('U18048', 'app149', 3, 'not too bad');
insert into feedback (user_id, app_id, rating, review)
values ('U19237', 'app126', 4, 'Saved me a lot of time');
insert into feedback (user_id, app_id, rating, review)
values ('U14301', 'app200', 2, 'Fix bug cannot see map');
insert into feedback (user_id, app_id, rating, review)
values ('U11363', 'app177', 5, 'Best app ever!');
insert into feedback (user_id, app_id, rating, review)
values (
        'U12537',
        'app191',
        1,
        'taking too long to open up'
    );
SELECT address
FROM users
WHERE user_id IN (
        SELECT user_id
        FROM transaction
        WHERE app_id IN (
                SELECT app_id
                FROM developer
                    NATURAL JOIN app
                    NATURAL JOIN transaction
                WHERE dev_name = 'Bluejam'
            )
    );
SELECT distinct(app_id),
    app_name,
    installs
FROM app
    NATURAL JOIN (
        SELECT app_id,
            COUNT(*) installs
        FROM transaction
        GROUP BY app_id
        ORDER BY COUNT(*) DESC
    ) AS top
    ORDER BY installs DESC;

